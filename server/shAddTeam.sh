#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <teamName> <author> <is_active>"
    exit 1
fi

TEAM_NAME=$1
AUTHOR=$2
IS_ACTIVE=$3

curl -X POST http://localhost:3000/api/teams \
-H "Content-Type: application/json" \
-d "{
    \"teamName\": \"$TEAM_NAME\",
    \"author\": \"$AUTHOR\",
    \"is_active\": $IS_ACTIVE
}"