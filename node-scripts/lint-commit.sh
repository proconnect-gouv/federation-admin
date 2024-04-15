#!/bin/sh

set -e

files=`git diff --name-only --cached -- '*.ts'`;

if [ -z "$files" ] 
then 
    echo 'no TS files to lint';
else  
    yarn tslint $files --exclude '**/node_modules/**/*';
fi
