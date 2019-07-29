

## Initialisation de l'index de stats

### Supprimer l'index de stats si il exite

Depuis l'hôte

```shell
curl -XDELETE  'http://localhost:9200/stats'
```

Résultat attendu :
```json
{"acknowledged":true}
```

### Créer l'index avec le schéma

Le schéma est versionné dans Infra.
Depuis l'hôte :

```shell
cd $FC_ROOT
curl -XPUT 'http://localhost:9200/stats' -d @Infra/ansible/roles/elasticsearch/files/mapping-stats.json
```
Résultat attendu :
```json
{"acknowledged":true}
```

### Charger les fixtures


```shell
docker exec -ti fc_stats_1 bash
cd /var/www/app/fc-stats
yarn run fixtures:es
```

Résultat attendu

```
Un gros pavé de JSON...
```

:warning: Les fixtures vont injecter des stats allant du 22/08/18 au 24/10/2018
