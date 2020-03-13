#!/usr/bin/env bash

CURRENTDATE=$(date +'%Y-%m-%d')
STARTDATE="2016-01-01"

#Call worker job that run the query to the db and register the data to Elastic index
runFcWorkerJob(){
  start=$2
  while [[ "$start" < "$CURRENTDATE" ]];
  do
      start=$(date -I -d "$start + 1 $1")
      echo ""
      echo "********************* $1 : $start *********************"
      cd /opt/fc/workers && ./run IndexMongoStats --count="activeFsCount" --range="$1" --start=$(date --rfc-3339=date -d "$start")
      echo ""
  done     
}

#Run the job with good flag
recoverData(){
  cd ../
  echo "----------------------- Recover Data per Days -------------------------"
  runFcWorkerJob "day" "$STARTDATE"
  echo "----------------------- Recover Data per Weeks -----------------------"
  runFcWorkerJob "week" "$STARTDATE"
  echo "----------------------- Recover Data per Month -----------------------"
  runFcWorkerJob "month" "$STARTDATE"
  echo "----------------------- Recover Data per Year --------------------------"
  runFcWorkerJob "year" "$STARTDATE"
  echo ""
}

#Run
recoverData
