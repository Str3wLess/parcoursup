window.PSU = window.PSU || {};
PSU.config = {
  API_BASE: "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets",
  DATASET_CURRENT: "fr-esr-parcoursup",
  DATASET_BY_YEAR: { 2020: "fr-esr-parcoursup_2020", 2021: "fr-esr-parcoursup_2021", 2022: "fr-esr-parcoursup_2022", 2023: "fr-esr-parcoursup_2023", 2024: "fr-esr-parcoursup_2024", 2025: "fr-esr-parcoursup" },
  DEFAULT_PAGE_SIZE: 18,
  STORAGE_KEY: "parcoursup.open_data.iut",
};
PSU.getBasePath = function () {
  var b = document.querySelector("base");
  if (!b || !b.href) return "";
  try { return new URL(b.href).pathname.replace(/\/$/, ""); } catch (e) { return ""; }
};
PSU.stripBase = function (pathname) {
  var base = PSU.getBasePath();
  console.log("stripBase - base:", base, "pathname:", pathname);
  var p = pathname || "/";
  if (base && p.indexOf(base) === 0) p = p.slice(base.length) || "/";
  if (!p || p[0] !== "/") p = "/" + p;
  console.log("stripBase result:", p);
  return p;
};
PSU.parseRoute = function (pathname) {
  var stripped = PSU.stripBase(pathname);
  console.log("parseRoute called with:", pathname, "stripped:", stripped);
  var parts = stripped.split("/").filter(Boolean);
  console.log("parts:", parts);
  if (parts.length === 0) return { name: "home", params: {} };
  if (parts[0] === "formation" && parts[1])
    return { name: "formation", params: { id: decodeURIComponent(parts[1]) } };
  if (parts[0] === "compare") return { name: "compare", params: {} };
  return { name: "home", params: {} };
};
PSU.href = function (path) {
  var base = PSU.getBasePath();
  if (!path || path === "/") return base ? base + "/" : "/";
  if (path[0] !== "/") path = "/" + path;
  return (base || "") + path;
};
