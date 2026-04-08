# Open Data Parcoursup (RIOT)

Application statique **HTML / CSS / JavaScript** : recherche sur le jeu `fr-esr-parcoursup` (API Explore data.gouv MESR), fiche formation, comparaison + score indicatif, persistance `localStorage`.

## Fonctionnalités

###  Recherche avancée
- Recherche plein texte sur les formations
- Filtres par capacité, taux d'accès, département, type d'établissement
- Tri par taux d'accès, nombre de vœux, capacité
- Pagination des résultats avec navigation fluide
- Carte interactive avec localisation des formations

###  Fiche formation détaillée
- Informations générales (capacité, localisation, etc.)
- Statistiques d'admission (phase principale et complémentaire)
- Profils des admis (type de bac, mentions, répartition géographique)
- Évolution historique des taux d'accès et mentions
- Graphiques CSS intégrés avec tooltips interactifs
- Indicateurs clés avec barres de progression

###  Aide à l'orientation
- Comparaison de plusieurs formations
- Score indicatif personnalisé selon le profil du lycéen
- Persistance locale des sélections et du profil
- Calcul de notes seuils estimées
- Évaluation de la difficulté (Élevée/Moyenne/Faible)
- Recommandations basées sur la série et la moyenne du bac

###  Export de données
- Export des résultats au format CSV (Excel)
- Export au format JSON
- Téléchargement direct des données filtrées

###  Performance et UX
- Indicateurs de chargement animés
- Gestion d'erreurs améliorée avec messages clairs
- Timeout des requêtes API (15s)
- Effets visuels au survol des graphiques
- Navigation SPA fluide
- Design responsive adapté aux mobiles
- Interface responsive et accessible

## URL de rendu attendue (IUT)

`http://dwarves.iut-fbleau.fr/~khadir/parcoursup`

Adapter `<base href="...">` dans `index.html` pour correspondre au sous-chemin réel (ex. `/~login/parcoursup/`).

## Lancer en local

Servir le dossier en HTTP (pas en `file://`) pour que `fetch`, RIOT et les fichiers `.riot` se chargent correctement :

```bash
# Python 3
python3 -m http.server 8080

# Ou avec Python sur Windows
py -3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`.

## Apache (réécriture d'URL)

Fichier `.htaccess` fourni : toutes les URLs non fichier sont renvoyées vers `index.html` pour le routeur côté client.

## Dépendances (CDN)

- Riot.js 9 + compilateur (`riot+compiler`)
- Leaflet 1.9 + tuiles OpenStreetMap

## Architecture

### Composants RIOT
- **app-root** : Layout principal et routeur
- **search-page** : Page de recherche avec filtres et export
- **filters-panel** : Panneau de filtres avancés
- **export-data** : Composant d'export de données
- **loading-spinner** : Indicateur de chargement
- **map-view** : Carte interactive Leaflet
- **formation-page** : Fiche détaillée d'une formation
- **compare-page** : Page de comparaison et d'aide à l'orientation

### Services JavaScript
- **apiClient.js** : Client API avec gestion d'erreurs et timeout
- **storage.js** : Persistance localStorage
- **store.js** : Gestion d'état centralisée
- **parcoursupModel.js** : Modèle de données et score conseiller
- **config.js** : Configuration et utilitaires

## Documentation des composants

Voir [COMPONENTS.md](COMPONENTS.md) pour une documentation détaillée de chaque composant, leurs entrées, sorties et modes de communication.

## Améliorations récentes

-  Filtres avancés pour affiner la recherche
-  Export de données (CSV/JSON)
-  Spinners de chargement animés
-  Gestion d'erreurs robuste avec timeout
-  Interface utilisateur améliorée
-  Composants réutilisables et modulaires
-  Graphiques interactifs avec tooltips détaillés
-  Indicateurs clés avec barres de progression
-  Aide à l'orientation avec scores réalistes
-  Effets visuels au survol des éléments
-  Design responsive optimisé
-  Navigation SPA fluide et fonctionnelle

## Données et limitations

- **Source** : API Open Data Parcoursup (data.gouv.fr)
- **Couverture** : ~15 000 formations publiques
- **Période** : Données 2020-2024 selon disponibilité
- **Limitations** : Ne contient pas toutes les formations privées ou spécialisées
- **Mise à jour** : Annuelle selon les publications ministérielles

## Déploiement

Pour le déploiement sur un serveur avec sous-chemin :
1. Modifier `<base href="/">` vers `<base href="/votre/chemin/">`
2. Adapter les chemins dans `config.js` si nécessaire
3. Uploader les fichiers sur le serveur
