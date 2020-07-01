#!/usr/bin/env bash
if [[ $# -ne 1 ]];
then
  echo "Usage: ./account-computation.sh <startDate -> YYYY-MM-DD>"
  exit 1
fi

CURRENTDATE=$(date +'%Y-%m-%d')
STARTDATE=$1

#Call worker job that run the query to the db and register the data to Elastic index
runFcWorkerJob(){
  cd /opt/fc/workers
  start=$2
  while [[ "$start" < "$CURRENTDATE" ]];
  do
      start=$(date -I -d "$start + 1 $1")
      echo ""
      echo "********************* $1 : $start *********************"
      ./run IndexMongoStats --count="account" --range="$1" --start=$(date --rfc-3339=date -d "$start")
      echo ""
  done     
}

#Run the job with good flag
recoverData(){
  cd ../
  echo "----------------------- Recover Data per Days -------------------------"
  runFcWorkerJob "day" "$STARTDATE"
}

#Run
recoverData
