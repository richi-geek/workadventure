Date: 24-04-2023
# Deployer WA sur une instance EC2

## Context and Problem Statement

Dans l'objectif de faire un POC, on a deployé WorkAdventure sur une suele instance EC2 avec une adresse IP publique.

## Considered Options

* Fichier `docker-compose.prod.yaml` sur le GitHub de WA.
* DNS wildcard (nip.io)
* DNS ocho-ninja (AWS route 53)

## Pros and Cons of the Options

### Fichier `docker-compose.prod.yaml`

* Good : Facile à deployer, on adapte un peu le fichier et les variables `.env`.
* Bad : si un conteneur tombe, il n'y a pas d'alertes ou de remontés automatiques de ce conteneur. 

### DNS wildcard (nip.io)
* Good : pas de configuration, on a une adresse type `http://adresse_ip.nip.io`
* Bad : pas des vrais certificats SSL. C'est un choix uniquement pour tester et faire des POCs, pas à utiliser sur un environnement de production.

### DNS ocho-ninja (AWS route 53)
* Good : configuration facile et persistante, il n'y a pas besoin de re-créer les records du DNS.

## More Information

L'appli a été deployé en utilisant le fichier `docker-compose.prod.yaml` de la version _master_ (v1.15.10) avec les modifications suivantes :
- décommenter la ligne de stagigng let's encrypt
- changer la variable $PLAY_URL par $FRONT_HOST
- commenter toutes les variables $ADMIN_API_*

Modifications pour `.env`:
- SECRET_KEY
- Tous les sous-domaines (*_HOST)
- Changer le type de fichier de START_ROOM de `.json` vers `.tmj`
- Domaines de ejabberd (EJABBERD_DOMAIN et EJABBERD_WS_URI)

Concernant les certificats SSL, on utilisait le domain de staging de Let's Encrypt. On a une limite de 50 certificats par semaine et chacun de nos sous-damines en générait un (donc, environ 10 certificats générés par déploiement). Il faut penser alors à en générer un seul qui fonctionne pour tous les sous-domaines et à le stocker. 