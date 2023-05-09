Date: 04-05-2023
# Deployer WA de façon distribuée (une instance EC2 par conteneur)

## Context and Problem Statement

Dans l'objectif de faire un POC, on a deployé WorkAdventure sur plusieurs instance EC2, chacune avec une adresse IP publique.

## Considered Options

### - Ajout d'un troisième module Terraform *dns*.

Ce module nous permet d'ajouter autant de records dans la resource AWS Zone 53 **aws.ocho.ninja** grâce à la variable *workadventure_records* et les *outputs* avec les adresses IP des instances deployées.

### - Utilisation de Ansible pour la configuration des instances

Etant donné qu'on deploie 9 instances, c'est embetant de les configurer chacune. On a crée donc un role par conteneur.

> TODO : script qui ajoute les adresses IP depuis *terraform output* à `hosts.ini` et à `traefik/config.yml`

## Result

On peut se connecter au dashboard de traefik et à l'adresse `play.workadventure.aws.ocho.ninja` néanmoins, on a un problème *Network error*.

Traefik fait son travail de reverse-proxy après une bonne configuration !

## Problems

Le *Network error* est dû à une mauvaise requête GET fait au endpoint `play.workadventure.aws.ocho.ninja/map` il faudra reviser un par un les services/conteneurs (et même le code source).

Voici une liste des problèmes rencontrés lors du deploiement :

- api (back) : ne se connecte pas à redis. **Corrigé** (voir ci-dessous)
- chat : ne trouve pas des fichiers dans le conteneur dans le dossier /usr/shared/nginx/...
- ejabberd : envsubst. **Corrigé** quand on copie le fichier `ejabberd.template.yml` présent dans le git.
- maps : ajout des variables $MAP_STORAGE_*
- play : endpoint `/maps` qui ne repond pas (je n'ai pas trouvé le motif)
- redis : uploader et api ne se connectent pas à redis. **Corrigé** en ajoutant la ligne `command: redis-server --bind 0.0.0.0` dans le docker-compose et en exposant le port 6379
- traefik : le plus dur à configurer. On a deux nouveaux fichiers `config.yml` et `traefik.yml`, ainsi que le docker-compose est modifié aussi. (changelog à mettre dans ansible/roles/traefik ?). Pour l'obtention du certificat SSL, on utilise l'url de staging de Let's Encrypt et on vérifie notre domaine avec un *dnsChallenge* qui est fait avec l'aide d'un noveau utilisateur AWS avec les IAM policies suivantes :

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "route53:GetChange",
                    "route53:ChangeResourceRecordSets",
                    "route53:ListResourceRecordSets"
                ],
                "Resource": [
                    "arn:aws:route53:::hostedzone/*",
                    "arn:aws:route53:::change/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": "route53:ListHostedZonesByName",
                "Resource": "*"
            }
        ]
    }
    ```

    On envoie aussi le ACCESS_KEY et le SECRET_KEY dans le docker-compose comme variables d'environnement (pas secure, trouver une autre solution plus securisée).

- uploader : modifier les variables $UPLOADER_REDIS_* selon l'adresse IP de notre instance redis.