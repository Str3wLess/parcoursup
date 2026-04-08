window.PSU = window.PSU || {};

PSU.store = {
  _listeners: [],
  state: {
    route: { name: "home", params: {} },
    searchQuery: "",
    searchSort: "taux",
    searchPage: 0,
    searchResults: null,
    searchError: null,
    searchLoading: false,
    selections: [],
    userProfile: { serie: "gen", note: "12" },
  },

  init() {
    var saved = PSU.storage.load();
    this.state.selections = saved.selections || [];
    this.state.userProfile = saved.userProfile || { serie: "gen", note: "12" };
    this.state.route = PSU.parseRoute(window.location.pathname);
  },

  subscribe(fn) {
    this._listeners.push(fn);
    var self = this;
    return function () {
      self._listeners = self._listeners.filter(function (x) { return x !== fn; });
    };
  },

  notify() {
    this._listeners.forEach(function (fn) {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  },

  persistSelections() {
    PSU.storage.save({
      selections: this.state.selections,
      userProfile: this.state.userProfile,
    });
  },

  setRouteFromLocation() {
    var newRoute = PSU.parseRoute(window.location.pathname);
    console.log("Setting route from location:", window.location.pathname, "Parsed route:", newRoute);
    this.state.route = newRoute;
    this.notify();
  },

  navigate(path) {
    var url = PSU.href(path);
    console.log("Store.navigate called with:", path, "URL:", url);
    if (url === window.location.pathname + window.location.search) {
      console.log("Same URL, setting route from location");
      this.setRouteFromLocation();
      return;
    }
    console.log("Pushing state to:", url);
    history.pushState({}, "", url);
    this.setRouteFromLocation();
  },

  setUserProfile(profile) {
    this.state.userProfile = Object.assign({}, this.state.userProfile, profile);
    this.persistSelections();
    this.notify();
  },

  toggleSelection(summary) {
    if (!summary || !summary.id) return;
    var i = this.state.selections.findIndex(function (x) {
      return x.id === summary.id;
    });
    if (i >= 0) this.state.selections.splice(i, 1);
    else this.state.selections.push(summary);
    this.persistSelections();
    this.notify();
  },

  removeSelection(id) {
    this.state.selections = this.state.selections.filter(function (x) {
      return x.id !== id;
    });
    this.persistSelections();
    this.notify();
  },

  isSelected(id) {
    return this.state.selections.some(function (x) { return x.id === id; });
  },
};
