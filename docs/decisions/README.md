# Structure du projet Terraform

Le dossier terraform est composé de la façon suivante :
    
    terraform
    |-- modules
        |-- instance
        |-- network
    |-- secret-santa
    |-- workadventure

Dans **modules**, il y a la création de ressources, les outputs et variables.

Dans **secret-santa** et **workadventure**, il y a un fichier `main.tf` qui utilise à besoin les modules et des scripts `.sh` à utiliser par `user_data`.