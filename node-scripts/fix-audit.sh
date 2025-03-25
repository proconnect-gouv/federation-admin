#!/bin/bash

MAPPINGS_PATH="infra/ansible/roles/elasticsearch/files"
cd $FC_ROOT

mkdir -p "$MAPPINGS_PATH"

cp $FC_ROOT/proconnect-exploitation/node-scripts/mappings/create_index_business.json "$MAPPINGS_PATH/."
cp $FC_ROOT/proconnect-exploitation/node-scripts/mappings/create_index_stats.json "$MAPPINGS_PATH/."
