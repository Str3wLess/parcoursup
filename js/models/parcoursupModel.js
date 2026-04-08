window.PSU = window.PSU || {};

PSU.model = {
  coords(raw) {
    var g = raw && raw.g_olocalisation_des_formations;
    if (!g || typeof g !== "object") return null;
    if (g.lat == null || g.lon == null) return null;
    return { lat: Number(g.lat), lon: Number(g.lon) };
  },

  summaryFromRecord(raw) {
    var c = PSU.model.coords(raw);
    return {
      id: raw.cod_aff_form,
      cod_uai: raw.cod_uai,
      titre: raw.lib_comp_voe_ins || raw.lib_for_voe_ins,
      filiere: raw.fili,
      ville: raw.ville_etab,
      dep: raw.dep,
      capa: raw.capa_fin,
      taux: raw.taux_acces_ens,
      session: raw.session,
      lat: c ? c.lat : null,
      lon: c ? c.lon : null,
      lien: raw.lien_form_psup,
      raw: raw,
    };
  },

  admissionRows(raw, phase) {
    if (phase !== "pc") {
      var rows = [
        { label: "Gén.", voeux: raw.nb_voe_pp_bg, classes: raw.nb_cla_pp_bg, prop: raw.prop_tot_bg, acc: raw.acc_bg },
        { label: "Techno.", voeux: raw.nb_voe_pp_bt, classes: raw.nb_cla_pp_bt, prop: raw.prop_tot_bt, acc: raw.acc_bt },
        { label: "Pro.", voeux: raw.nb_voe_pp_bp, classes: raw.nb_cla_pp_bp, prop: raw.prop_tot_bp, acc: raw.acc_bp },
        { label: "Autres", voeux: raw.nb_voe_pp_at, classes: raw.nb_cla_pp_at, prop: raw.prop_tot_at, acc: raw.acc_at },
      ];
      rows.push({
        label: "Total",
        voeux: raw.nb_voe_pp,
        classes: raw.nb_cla_pp,
        prop: raw.prop_tot,
        acc: raw.acc_pp,
      });
      return rows;
    }
    var pc = [
      { label: "Gén.", voeux: raw.nb_voe_pc_bg, classes: null, prop: null, acc: null },
      { label: "Techno.", voeux: raw.nb_voe_pc_bt, classes: null, prop: null, acc: null },
      { label: "Pro.", voeux: raw.nb_voe_pc_bp, classes: null, prop: null, acc: null },
      { label: "Autres", voeux: raw.nb_voe_pc_at, classes: null, prop: null, acc: null },
    ];
    pc.push({
      label: "Total",
      voeux: raw.nb_voe_pc,
      classes: raw.nb_cla_pc,
      prop: null,
      acc: raw.acc_pc,
    });
    return pc;
  },

  fillingTimeline(raw) {
    return [
      { label: "Début PP", pct: raw.pct_acc_debutpp, n: raw.acc_debutpp },
      { label: "Journée du bac", pct: raw.pct_acc_datebac, n: raw.acc_datebac },
      { label: "Fin PP", pct: raw.pct_acc_finpp, n: raw.acc_finpp },
    ].filter(function (x) { return x.pct != null || x.n != null; });
  },

  profileBacShares(raw) {
    var tot = Number(raw.acc_tot) || 0;
    if (!tot) return [];
    return [
      { key: "gen", label: "Gén.", pct: Math.round(((Number(raw.acc_bg) || 0) / tot) * 1000) / 10 },
      { key: "tec", label: "Tech.", pct: Math.round(((Number(raw.acc_bt) || 0) / tot) * 1000) / 10 },
      { key: "pro", label: "Pro.", pct: Math.round(((Number(raw.acc_bp) || 0) / tot) * 1000) / 10 },
      { key: "aut", label: "Aut.", pct: Math.round(((Number(raw.acc_at) || 0) / tot) * 1000) / 10 },
    ];
  },

  profileMentions(raw) {
    return [
      { key: "sans", label: "P", pct: raw.pct_sansmention || 0 },
      { key: "ab", label: "AB", pct: raw.pct_ab || 0 },
      { key: "b", label: "B", pct: raw.pct_b || 0 },
      { key: "tb", label: "TB", pct: raw.pct_tb || 0 },
      { key: "tbf", label: "TBF", pct: raw.pct_tbf || 0 },
    ];
  },

  advisorScore(summaryOrRaw, user) {
    var raw = summaryOrRaw.raw || summaryOrRaw;
    var taux = Number(raw.taux_acces_ens);
    if (isNaN(taux) || taux === 0) taux = 50;
    // si le taux est à 100, c'est sûrement une donnée manquante, on met une valeur réaliste
    if (taux === 100) taux = 25; // taux moyen pour les formations sélectives
    
    var serie = user.serie || "gen";
    var part = serie === "tec" ? Number(raw.part_acces_tec) : serie === "pro" ? Number(raw.part_acces_pro) : Number(raw.part_acces_gen);
    
    // Ignorer les données de l'API si elles sont trop faibles (données manquantes ou non fiables)
    if (isNaN(part) || part === 0 || part < 10) {
      // Valeurs par défaut selon le type de formation et la série demandée
      var formationType = raw.lib_comp_voe_ins.toLowerCase();
      if (formationType.includes('dut') || formationType.includes('iut') || formationType.includes('techno') || formationType.includes('bts')) {
        // Formations technologiques : avantage au bac techno
        part = serie === "tec" ? 45 : serie === "pro" ? 25 : 30;
      } else if (formationType.includes('licence') || formationType.includes('général')) {
        // Formations générales : avantage au bac général
        part = serie === "gen" ? 50 : serie === "tec" ? 30 : 20;
      } else {
        // Autres formations : valeurs moyennes
        part = serie === "gen" ? 40 : serie === "tec" ? 35 : 25;
      }
      console.log("Using default part values because API data is too low:", {apiPart: part, defaultPart: part});
    }
    
    var note = parseFloat(String(user.note || "12").replace(",", "."));
    if (isNaN(note)) note = 12;
    var noteFactor = 0.85 + Math.min(20, Math.max(0, note)) / 40;
    var bacFactor = 0.7 + (part / 100) * 0.6;
    var score = Math.round(Math.min(100, Math.max(5, taux * noteFactor * bacFactor)));
    
    console.log("advisorScore debug:", {
      formation: raw.lib_comp_voe_ins,
      userSerie: serie,
      partData: {
        gen: raw.part_acces_gen,
        tec: raw.part_acces_tec,
        pro: raw.part_acces_pro
      },
      selectedPart: part,
      note: note,
      noteFactor: noteFactor,
      bacFactor: bacFactor,
      score: score
    });
    
    // calcul de la note minimale estimée pour être admis
    var noteSeuil = Math.round(((100 / taux) / (noteFactor * bacFactor)) * 20 * 10) / 10;
    if (noteSeuil > 20) noteSeuil = 20;
    if (noteSeuil < 5) noteSeuil = 5;
    
    return { 
      score: score, 
      taux: taux, 
      partBac: part, 
      noteFactor: Math.round(noteFactor * 100) / 100,
      noteSeuil: noteSeuil
    };
  },
};

