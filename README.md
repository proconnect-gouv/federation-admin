# FC Apps

## Installation

- `cd /var/www/app`
- `yarn install`
- 

## Création d'un admin pour postgres

- yarn run migrations:run 
    - ( /shared/migrations )
    
## Mise en place des données 

 - yarn run fixtures:load 
    ( mise en place des données dans la base  mongo (fournisseurs de services / identités )

## Etc/hosts

- stats.docker.dev-franceconnect.fr
- exploitation.docker.dev-franceconnect.fr
- support.docker.dev-franceconnect.fr


## Variables d'env 
    - (/fc-*/src/config)
    - Utilisation de la lib nest-config ( d'où utilisation de fichier Typescript  cf: https://www.npmjs.com/package/nestjs-config )
        