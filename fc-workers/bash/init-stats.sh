#!/usr/bin/env bash

ES="http://localhost:9200"
LOG_FILE="/tmp/out.log"
CURRENT_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


[ $1 ] && STEP=$1 || STEP="1"

declare -A labels
declare -A commands

### Helpers ###########################

addCommand() {
  INDEX=$((${#labels[@]}+1))
  labels[$INDEX]=$1
  commands[$INDEX]=$2
}

shouldWeProceed() {
  echo -n "# Should we proceed? [Y/n]"
  read CONTINUE

  if [[ "$CONTINUE" == "n" || $CONTINUE == "N" ]]
  then
    echo "# Script canceled by user"
    exit 1
  fi
}

echoLog() {
  echo $1 | tee -a $LOG_FILE
}

command() {
  LABEL=$1
  CMD=$2
  echoLog "#  $1: "
  echoLog "#  > $2"
  echoLog "#"
  shouldWeProceed

  echoLog "# start: `date`"
  echoLog "---------------------------------"
  $2 2>&1 | tee -a $LOG_FILE
  echoLog "---------------------------------"
  echoLog "# stop: `date`"
}

proceed() {
  CURRENT_STEP=$1
  NEXT_STEP=$(($CURRENT_STEP+1))
  STEP_COUNT="${#labels[@]}"

  echo "# ================================="
  echo "#  Step $CURRENT_STEP/$STEP_COUNT"

  command "${labels[$CURRENT_STEP]}" "${commands[$CURRENT_STEP]}"

  if [ "${labels[$NEXT_STEP]}" ]
  then
    proceed "$NEXT_STEP"
  else
    echo "# ================================="
    echo "# All done!"; exit 0;
  fi
}

### Run ###############################


# Read index state
addCommand "Get current number of logs in legacy index" \
"curl -s $ES/franceconnect/_search?pretty=true&size=0"

addCommand "Get status/entries count in stats index before import (a missing index is OK here)" \
"curl -s $ES/events/_search?pretty=true&&size=0"

# Import 2019-2020: 1 run / month
addCommand "Import stats for january 2020" \
"./run IndexElasticLogs --start=2020-01-01 --stop=2020-02-01"

addCommand "Import stats for december 2019" \
"./run IndexElasticLogs --start=2019-12-01 --stop=2020-01-01"

addCommand "Import stats for november 2019" \
"./run IndexElasticLogs --start=2019-11-01 --stop=2019-12-01"

addCommand "Import stats for october 2019" \
"./run IndexElasticLogs --start=2019-10-01 --stop=2019-11-01"

addCommand "Import stats for september 2019" \
"./run IndexElasticLogs --start=2019-09-01 --stop=2019-10-01"

addCommand "Import stats for august 2019" \
"./run IndexElasticLogs --start=2019-08-01 --stop=2019-09-01"

addCommand "Import stats for july 2019" \
"./run IndexElasticLogs --start=2019-07-01 --stop=2019-08-01"

addCommand "Import stats for june 2019" \
"./run IndexElasticLogs --start=2019-06-01 --stop=2019-07-01"

addCommand "Import stats for may 2019" \
"./run IndexElasticLogs --start=2019-05-01 --stop=2019-06-01"

addCommand "Import stats for april 2019" \
"./run IndexElasticLogs --start=2019-04-01 --stop=2019-05-01"

addCommand "Import stats for march 2019" \
"./run IndexElasticLogs --start=2019-03-01 --stop=2019-04-01"

addCommand "Import stats for february 2019" \
"./run IndexElasticLogs --start=2019-02-01 --stop=2019-03-01"

addCommand "Import stats for january 2019" \
"./run IndexElasticLogs --start=2019-01-01 --stop=2019-02-01"

addCommand "Import stats for january 2019" \
"./run IndexElasticLogs --start=2019-01-01 --stop=2019-02-01"

# Import 2018: 1 run / 2 months
addCommand "Import stats for nov/dec 2018" \
"./run IndexElasticLogs --start=2018-11-01 --stop=2018-12-31"

addCommand "Import stats for sept/oct 2018" \
"./run IndexElasticLogs --start=2018-09-01 --stop=2018-10-31"

addCommand "Import stats for jul/aug 2018" \
"./run IndexElasticLogs --start=2018-07-01 --stop=2018-08-31"

addCommand "Import stats for may/jun 2018" \
"./run IndexElasticLogs --start=2018-05-01 --stop=2018-06-30"

addCommand "Import stats for mar/apr 2018" \
"./run IndexElasticLogs --start=2018-03-01 --stop=2018-04-30"

addCommand "Import stats for jan/feb 2018" \
"./run IndexElasticLogs --start=2018-01-01 --stop=2018-02-28"

# Import 2016 - 2017: 1 run / 6 months
addCommand "Import stats for jul/dec 2017" \
"./run IndexElasticLogs --start=2017-07-01 --stop=2017-12-31"

addCommand "Import stats for jan/jun 2017" \
"./run IndexElasticLogs --start=2017-01-01 --stop=2017-06-30"

addCommand "Import stats for jul/dec 2016" \
"./run IndexElasticLogs --start=2016-07-01 --stop=2016-12-31"

addCommand "Import stats for jan/jun 2016" \
"./run IndexElasticLogs --start=2016-01-01 --stop=2016-06-30"

# Read index state
addCommand "Get status/number of entries in stats index after import" \
"curl -s $ES/events/_search?pretty=true&size=0"




cat <<EOF

  **About this script**"

- This script will initialize new stats index.
- You will be prompted to continue before each command is run.
  If you stop, the whole script will stop.
- Actions perfomed here are idempotent, thus it can be ran multiple times.
- Order of actions does not matter
  (expect for control queries which makes sense only before and after the run
  but those are read only operations).

You may pass the script a step number in order to restart from this point.
 > init-stats-index.sh <step number>

EOF

if [ "$STEP" != "1" ]
then
  echo "# You are about to start from step $STEP"
  echo "# "
fi


cd $CURRENT_SCRIPT_DIR/../

shouldWeProceed

proceed $STEP
