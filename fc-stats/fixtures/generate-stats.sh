#!/usr/bin/env bash

ES_LOG="http://localhost:9200"
ES_STATS="http://localhost:9200"
START=$(date --rfc-3339=date -d "-1 year")
STOP=$(date --rfc-3339=date -d "1 year")
LOGS_PER_DAY=1000
VARIATION=0.10

cd $FC_ROOT

echo "Generate log for period $START to $STOP"


echo "Delete log index"
curl -XDELETE "$ES_LOG/franceconnect"
echo ""

echo "Create log index"
curl -XPUT "$ES_LOG/franceconnect" -d '@Infra/ansible/roles/elasticsearch/files/mapping_wip.json'
echo ""

echo "Delete stats index"
curl -XDELETE "$ES_STATS/stats"
echo ""

echo "Create stats index"
curl -XPUT "$ES_STATS/stats" -d '@Infra/ansible/roles/elasticsearch/files/mapping-stats.json'
echo ""

echo "Generate logs"
docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers/tests/fixtures && node generate-logs.js $START $STOP $LOGS_PER_DAY $VARIATION"

echo "Sleep 2 seconds to give elastic some rest"
sleep 2

echo "Generate stats"
docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticLogs --start=$START --stop=$STOP"


echo "Generate metrics stats"
CURRENT_DATE=$START
while [ "$CURRENT_DATE" != "$STOP" ]
do
  DAY=$(date -d $CURRENT_DATE "+%d")
  MONTH=$(date -d $CURRENT_DATE "+%m")
  WEEK_DAY=$(date -d $CURRENT_DATE "+%u")

  # Tous les jours
  docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticStats --start=$CURRENT_DATE --count=activeAccount --range=day"

  # Premier jour de la semaine
  if [ "$WEEK_DAY" == "1" ]
  then
    docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticStats --start=$CURRENT_DATE --count=activeAccount --range=week"
  fi

  # Premier jour du mois
  if [ "$DAY" == "01" ]
  then
    docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticStats --start=$CURRENT_DATE --count=activeAccount --range=month"
  fi

  # Premier jour de l'année
  if [ "$DAY" == "01" -a "$MONTH" == "01" ]
  then
    docker exec -ti fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticStats --start=$CURRENT_DATE --count=activeAccount --range=year"
  fi

  CURRENT_DATE=$(date  -I -d "$CURRENT_DATE + 1 day");
done
