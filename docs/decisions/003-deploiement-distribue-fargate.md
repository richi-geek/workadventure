Date: 04-05-2023
# Deployer WA de façon distribuée (avec ECS - Fargate)

## Context and Problem Statement

Dans l'objectif de faire un POC, on a deployé WorkAdventure avec un service de conteneurs managés de AWS : Elastic Container Service (ECS).

## Considered Options

### - *Launch type* ECS 
https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html
### - *Launch type* Fargate 

## Result

## Problems

- Transformer un type `Output<string>` vers string pour utiliser des parametres des ressources créées (par exemple, le nom DNS du load balancer) dans une *TaskDefinition*. Resolu avec `pulumi.interpolate` et la méthode `apply()` de la classe `Output<string>`. 