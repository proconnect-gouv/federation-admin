#!/bin/bash

STACK="$FC_ROOT/fc-docker/docker-stack"

# Exploitation
$STACK exec fc-exploitation yarn migrations:run
$STACK exec fc-exploitation yarn fixtures:load
$FC_ROOT/fc-apps/shared/cypress/support/db.sh exploitation create

# Support
$STACK exec fc-support yarn migrations:run
$STACK exec fc-support yarn fixtures:load
$FC_ROOT/fc-apps/shared/cypress/support/db.sh support create

# Stats
$STACK exec fc-stats yarn migrations:run
$STACK exec fc-stats yarn fixtures:load
$FC_ROOT/fc-apps/shared/cypress/support/db.sh stats create
