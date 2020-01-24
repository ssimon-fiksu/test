#!/usr/bin/env bash

DATE=$(date +%Y%m%d_%H%m)
REPO=$1
if [ -z $2 ]
then
FILENAME=${REPO}.tgz
else
FILENAME=$2
fi

# Let create release in github

JSON="{
  \"tag_name\": \"$DATE\",
  \"target_commitish\": \"staging\",
  \"name\": \"$DATE\",
  \"body\": \"Release $DATE\",
  \"draft\": false,
  \"prerelease\": false
}"

UPLOAD_URL=$(curl -s -XPOST \
  --url https://api.github.com/repos/fiksu/${REPO}/releases?access_token=${GITPASS} \
  -H "Host: api.github.com" \
  -H "Content-Type: application/json" \
  --data "${JSON}"|jq -r '.upload_url')

UPLOAD_URL="${UPLOAD_URL%\{*}"

curl -s -H "Authorization: token ${GITPASS}"  \
        -H "Content-Type: application/zip" \
        --data-binary @dist/$FILENAME  \
        "${UPLOAD_URL}?name=${FILENAME}&label=${FILENAME}" \
        | jq '.'
