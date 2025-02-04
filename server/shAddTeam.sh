#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <teamName> <author> <isActive>"
    exit 1
fi

TEAM_NAME=$1
AUTHOR=$2
IS_ACTIVE=$3

curl -X POST http://0.0.0.0:3000/api/teams \
-H "Content-Type: application/json" \
-d "{
    \"teamName\": \"$TEAM_NAME\",
    \"author\": \"$AUTHOR\",
    \"isActive\": $IS_ACTIVE
}"