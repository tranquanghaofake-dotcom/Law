#!/bin/bash
# usage: tim.sh url
curl -sS --compressed -L -m 30 -A "Mozilla/5.0" "$1" | grep -o '/theme/[a-z0-9-]*' | sed 's#/theme/##' | sort -u
