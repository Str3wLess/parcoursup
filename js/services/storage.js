window.PSU = window.PSU || {};

PSU.storage = {
  load() {
    try {
      var s = localStorage.getItem(PSU.config.STORAGE_KEY);
      if (!s) return { selections: [], userProfile: { serie: "gen", note: "12" } };
      return JSON.parse(s);
    } catch (e) {
      return { selections: [], userProfile: { serie: "gen", note: "12" } };
    }
  },
  save(data) {
    localStorage.setItem(PSU.config.STORAGE_KEY, JSON.stringify(data));
  },
};
