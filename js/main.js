window.PSU = window.PSU || {};

PSU.main = {
  boot() {
    PSU.store.init();
    window.addEventListener("popstate", function () {
      PSU.store.setRouteFromLocation();
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-nav]");
      if (!a) return;
      var href = a.getAttribute("href");
      console.log("Click navigation detected:", href);
      if (!href || href[0] === "#") return;
      if (a.getAttribute("target") === "_blank") return;
      var path = href;
      if (/^https?:\/\//i.test(href)) {
        try {
          var u = new URL(href);
          if (u.origin !== window.location.origin) return;
          path = u.pathname + u.search + u.hash;
        } catch (err) {
          return;
        }
      }
      var base = PSU.getBasePath();
      if (base && path.indexOf(base) === 0) {
        path = path.slice(base.length) || "/";
      }
      if (!path) path = "/";
      else if (path[0] !== "/") path = "/" + path;
      console.log("Navigating to:", path);
      e.preventDefault();
      PSU.store.navigate(path);
    });
    PSU.store.notify();
  },
};

riot.compile().then(function () {
  riot.mount("app-root");
  PSU.main.boot();
});
