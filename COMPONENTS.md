# Composants RIOT — Open Data Parcoursup

Convention : chaque fichier `.riot` exporte `export default { ... }`. Les tags sont enregistrés globalement après `riot.compile()`.

## `app-root`

- **Rôle** : layout (header, footer), routeur implicite (affiche une page selon `PSU.store.state.route`).
- **Entrées** : aucune prop externe ; lit `PSU.store`, `PSU.parseRoute`, `PSU.href`.
- **Sorties** : aucune ; contient les sous-pages.
- **Communication** : souscrit à `PSU.store.subscribe` pour mettre à jour `route` et `selCount` (nombre de formations en comparaison).

## `search-page`

- **Rôle** : recherche plein texte via API (`lib_for_voe_ins like "mot"`), tri, pagination, tableau + carte, filtres avancés, export de données.
- **État** : `q`, `sort`, `page`, `rows`, `markers`, `total`, erreurs, filtres, état de chargement.
- **Communication** : `PSU.api.searchFormations`, `PSU.model.summaryFromRecord`, `PSU.store.toggleSelection` (cases à cocher), navigation `data-nav` vers `/formation/:id`.
- **Nouveautés** : Intégration des filtres avancés, export CSV/JSON, spinner de chargement, gestion d'erreurs améliorée.

## `filters-panel`

- **Rôle** : panneau de filtres pour affiner la recherche (capacité, taux, département, type d'établissement).
- **Props** : `onFiltersChange` - fonction callback appelée lors du changement de filtres.
- **Communication** : notifie le composant parent des changements de filtres.
- **Nouveauté** : Composant réutilisable pour filtrer les résultats de recherche.

## `export-data`

- **Rôle** : export des données au format CSV ou JSON.
- **Props** : `data` - tableau de données à exporter.
- **Fonctionnalités** : Modal de sélection de format, génération et téléchargement de fichiers.
- **Nouveauté** : Permet aux utilisateurs d'exporter les résultats de recherche.

## `loading-spinner`

- **Rôle** : indicateur de chargement animé réutilisable.
- **Props** : `show` (booléen), `text` (texte optionnel à afficher).
- **Nouveauté** : Améliore l'UX en montrant un chargement clair pendant les requêtes API.

## `map-view`

- **Props** : `markers` — tableau `{ lat, lon, label, href }`.
- **Rôle** : carte Leaflet/OSM ; popups avec lien `data-nav`.
- **Cycle de vie** : `onUnmounted` détruit la carte.

## `formation-page`

- **Props** : `formationId` (code `cod_aff_form`).
- **Rôle** : charge l'enregistrement courant + l'historique (jeux `fr-esr-parcoursup_YYYY`), affiche admissions PP/PC, profils (graphiques CSS), évolution taux / mentions.
- **Communication** : `PSU.api.getFormationByCode`, `getFormationHistorySlices`, `PSU.model.*`, `PSU.store.toggleSelection` (bouton comparaison).
- **Améliorations** : Utilisation du loading-spinner pour une meilleure UX.

## `compare-page`

- **Rôle** : liste des formations sélectionnées, profil lycéen (série + note), score indicatif `PSU.model.advisorScore`.
- **Communication** : `PSU.store.state.selections`, `setUserProfile`, `removeSelection`, `subscribe` pour rafraîchir la liste.

## Modules JS (non RIOT)

| Fichier | Rôle |
|---------|------|
| `js/config.js` | Constantes API, jeux de données par année, helpers `href` / parseRoute. |
| `js/services/apiClient.js` | `fetch` vers `/records`, recherche, détail, historique, gestion d'erreurs améliorée, timeout. |
| `js/services/storage.js` | `localStorage` JSON. |
| `js/state/store.js` | État global, navigation `history.pushState`, sélections. |
| `js/models/parcoursupModel.js` | Adaptation des champs API → UI + score conseiller. |
| `js/main.js` | `riot.compile()` puis `riot.mount`, branchement navigation `data-nav`. |

## Navigation SPA

Les liens internes portent l'attribut `data-nav`. `PSU.main.boot()` intercepte le clic, appelle `PSU.store.navigate(href)` et met à jour la route sans recharger la page.

## Améliorations récentes

### Gestion des erreurs
- Timeout des requêtes API (15s)
- Messages d'erreur clairs et en français
- Gestion des erreurs réseau
- Interface pour effacer les erreurs

### Performance et UX
- Spinners de chargement animés
- Désactivation des contrôles pendant le chargement
- Filtres avancés pour affiner la recherche
- Export de données (CSV/JSON)
- Amélioration de la recherche avec caractères spéciaux

### Nouveaux composants
- `loading-spinner` : indicateur de chargement réutilisable
- `filters-panel` : filtres avancés pour la recherche
- `export-data` : export des résultats au choix du format

### Architecture
- Séparation claire des responsabilités
- Composants réutilisables et génériques
- Communication par props et callbacks
- Gestion d'état centralisée dans le store
