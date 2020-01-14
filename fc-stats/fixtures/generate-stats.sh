#!/usr/bin/env bash

ES_LOG="http://localhost:9200"
ES_STATS="http://localhost:9200"
START=$(date --rfc-3339=date -d "-1 year")
STOP=$(date --rfc-3339=date -d "1 year")
LOGS_PER_DAY=50
VARIATION=0.10
METRIC_GROWTH=0.03


if [[ -z $FC_ROOT ]]
then
  echo "Variable d'environement FC_ROOT manquante"
  exit 1;
fi

cd $FC_ROOT

echo "Generate log for period $START to $STOP"


echo "Delete log index"
curl -XDELETE "$ES_LOG/franceconnect"
echo ""

echo "Create log index"
curl -XPUT "$ES_LOG/franceconnect" -H 'Content-Type: application/json' -d '@Infra/ansible/roles/elasticsearch/files/mapping_wip.json'
echo ""

echo "Delete events index"
curl -XDELETE "$ES_STATS/events"
echo ""

echo "Create events index"
curl -XPUT "$ES_STATS/events" -H 'Content-Type: application/json' -d '@Infra/ansible/roles/elasticsearch/files/mapping-stats.json'
echo ""

echo "Delete metrics index"
curl -XDELETE "$ES_STATS/metrics"
echo ""

echo "Create metrics index"
curl -XPUT "$ES_STATS/metrics" -H 'Content-Type: application/json' -d '@Infra/ansible/roles/elasticsearch/files/mapping-stats.json'
echo ""

echo "Generate logs"
docker exec fc_workers_1 bash -c "cd /var/www/app/fc-workers/tests/fixtures && node generate-logs.js $START $STOP $LOGS_PER_DAY $VARIATION"

echo "Sleep 2 seconds to give elastic some rest"
sleep 2

echo "Generate stats"
docker exec fc_workers_1 bash -c "cd /var/www/app/fc-workers && ./run IndexElasticLogs --start=$START --stop=$STOP"

echo "Generate metrics stats"
docker exec fc_workers_1 bash -c "cd /var/www/app/fc-workers/tests/fixtures && node generate-metrics.js $START $STOP $METRIC_GROWTH"
