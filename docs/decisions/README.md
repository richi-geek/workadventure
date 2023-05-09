# Structure du projet Terraform

Le dossier terraform est composé de la façon suivante :
    
    terraform
    |-- modules
        |-- instance
        |-- network
    |-- secret-santa
    |-- app-wa

Dans **modules**, il y a la création de ressources, les outputs et variables.

Dans **secret-santa** et **app-wa**, il y a un fichier `main.tf` qui utilise à besoin les modules.