# Workers FranceConnect

Workers et cronjobs pour FranceConnect

Pour afficher l'aide et voir la liste des jobs disponibles :

1. Se rendre dans le chemin du projet
2. Exécuter :
   > ./run

## Génération des données "identités cumulées"

Avant de tester le job sur les comptes FranceConnect (IndexUserStats), vous pouvez générer de fausses inscriptions au service FranceConnect. La container de mongoDb doit être lancé pour que cela fonctionne.

1. Se rendre dans le container de fc-workers (docker-stack-legacy exec fc-workers bash)
2. Lancez le script de tests "generate-identities" (yarn debug generate-identities.js)
3. Une fois le script terminé, lancez le script InitIdentityES (./run InitIdentityES)

> Ce script permet de pré-injecter des valeurs mensuelles réelles d'inscriptions d'utilisateur pour obtenir une simulation cohérente

4. Lancez pour finir le script de création des métriques d'identités cumulées (./run IndexUserStats --metric=identity)

5. Lancez fc-stats pour obtenir la courbe des identités cumulés de FranceConnect
