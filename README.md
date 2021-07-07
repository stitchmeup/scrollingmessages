# scrollingmessages
Projet universitaire, messages défilants avec interface d'administration

Inclu un parseur XML en asynchrone

Fonctionne avec une BDD MongoDB, non fournie pour l'instant

(Développement abandonné)

Changelog:

☐ Front:
- Affichage défilants d'une pièce récupérée au format XML avec une requête AJAX
- Design de l'interface d'affichage des messages
- Auto-scroll pour l'affichage défilant
- Page d'acceuil avec formulaire pour générer requête GET d'affichage
- Navbar
- feuille de style
- SSR avec PUG (abandon d'HTML)

☐ Back
- Parser de fichier XML au format JSON (module xml2json)
- Helmet (CSP)
- CORS
- Authentification avec token JWT (stocké dans un cookie)
- Identification (login/mdp)
- MongoDB (utilisateurs créés, collection users)
- Routes
- SSR avec PUG (abandon d'HTML)

#15/03 v1.0

☐ Front:
- Utilisation des sources avec Bootstrap (pas d'accès internet pour les clients)
- Interface admin
- Chronomêtre (JSON feed)
- Récupération des messages urgents (JSON feed)
- Formulaire "dynamique" sur la page d'accueil

☐ Back
- Feed JSON pour les messages urgents
- Administration
   → Ajout de pièces (Fichier XML stocké en JSON dans une collection)
   → Changement mdp
   → Envoie message urgent
