window.PSU = window.PSU || {};

PSU.api = {
  /**
   * @param {string} datasetId
   * @param {Object} opts
   * @param {string} [opts.where]
   * @param {string} [opts.select]
   * @param {string} [opts.group_by]
   * @param {string} [opts.order_by]
   * @param {number} [opts.limit]
   * @param {number} [opts.offset]
   */
  async records(datasetId, opts) {
    opts = opts || {};
    var params = new URLSearchParams();
    if (opts.select) params.set("select", opts.select);
    if (opts.where) params.set("where", opts.where);
    if (opts.group_by) params.set("group_by", opts.group_by);
    if (opts.order_by) params.set("order_by", opts.order_by);
    if (opts.limit != null) params.set("limit", String(opts.limit));
    if (opts.offset != null) params.set("offset", String(opts.offset));
    var url = PSU.config.API_BASE + "/" + encodeURIComponent(datasetId) + "/records?" + params.toString();
    
    var controller = new AbortController();
    var timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      var res = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        var errorText = "";
        try {
          errorText = await res.text();
        } catch (e) {
          errorText = "Unable to read error response";
        }
        throw new Error(`API ${res.status}: ${errorText.slice(0, 200)}`);
      }
      
      var data = await res.json();
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid JSON response from API");
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("La requête a expiré (15s). Veuillez réessayer.");
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Erreur réseau. Vérifiez votre connexion internet.");
      }
      throw error;
    }
  },

  buildWhereFromKeywords(q) {
    var parts = String(q || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);
    if (!parts.length) return null;
    return parts
      .map(function (w) {
        var s = w.replace(/["']/g, "").replace(/\\/g, "").replace(/[()]/g, "");
        if (s.length < 2) return null;
        return 'lib_for_voe_ins like "%' + s + '%"';
      })
      .filter(Boolean)
      .join(" and ");
  },

  async searchFormations(q, options) {
    options = options || {};
    var limit = options.limit || PSU.config.DEFAULT_PAGE_SIZE;
    var offset = options.offset || 0;
    var where = PSU.api.buildWhereFromKeywords(q);
    var filters = options.filters || {};
    
    var filterConditions = [];
    if (filters.capacite) {
      filterConditions.push('capa_fin >= ' + Number(filters.capacite));
    }
    if (filters.taux) {
      filterConditions.push('taux_acces_ens >= ' + Number(filters.taux));
    }
    if (filters.departement) {
      filterConditions.push('dep = "' + filters.departement + '"');
    }
    if (filters.type) {
      filterConditions.push('contrat_etab = "' + filters.type + '"');
    }
    
    if (filterConditions.length > 0) {
      if (where) {
        where = '(' + where + ') and (' + filterConditions.join(' and ') + ')';
      } else {
        where = filterConditions.join(' and ');
      }
    }
    
    var orderMap = {
      taux: "taux_acces_ens desc",
      voeux: "voe_tot desc",
      capa: "capa_fin desc",
    };
    var order_by = orderMap[options.sort] || "";
    return PSU.api.records(PSU.config.DATASET_CURRENT, {
      where: where || undefined,
      limit: limit,
      offset: offset,
      order_by: order_by || undefined,
    });
  },

  async getFormationByCode(codAffForm) {
    var where = 'cod_aff_form = "' + String(codAffForm).replace(/"/g, "") + '"';
    var data = await PSU.api.records(PSU.config.DATASET_CURRENT, { where: where, limit: 1 });
    return data.results && data.results[0] ? data.results[0] : null;
  },

  async getFormationHistorySlices(codAffForm) {
    var ids = [];
    var years = [2020, 2021, 2022, 2023, 2024, 2025];
    var where = 'cod_aff_form = "' + String(codAffForm).replace(/"/g, "") + '"';
    for (var i = 0; i < years.length; i++) {
      var y = years[i];
      var ds = PSU.config.DATASET_BY_YEAR[y];
      try {
        var data = await PSU.api.records(ds, { where: where, limit: 1 });
        if (data.results && data.results[0]) {
          ids.push({ year: y, dataset: ds, raw: data.results[0] });
        }
      } catch (e) {
        /* formation absente cette année */
      }
    }
    return ids;
  },
};
