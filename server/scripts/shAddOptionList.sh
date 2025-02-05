#!/bin/bash

if [ "$#" -ne 6 ]; then
    echo "Usage: $0 <name> <list_data> <version> <supercedes> <author> <is_active>"
    exit 1
fi

NAME=$1
LIST_DATA=$2
VERSION=$3
SUPERCEDES=$4
AUTHOR=$5
ISACTIVE=$6


curl -X POST http://localhost:3000/api/option-lists \
-H "Content-Type: application/json" \
-d "{
    \"name\": \"$NAME\",
    \"list_data\": \"$LIST_DATA\",
    \"version\": \"$VERSION\",
    \"supercedes\": \"$SUPERCEDES\",
    \"author\": \"$AUTHOR\",
    \"is_active\": \"$ISACTIVE\"

}"