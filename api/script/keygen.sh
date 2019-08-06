#!/bin/bash

SECRET=$(python -c 'import random; print("".join([random.choice("abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)") for i in range(50)]))' | base64)
AUTO_ADDED=false
if [[ ! -f "secrets/vars" ]] ; then
  echo "API_SECRET=$SECRET" > secrets/vars
  AUTO_ADDED=true
fi

printf "New API Secret: %s" "$SECRET"
printf '\n\nAdd this key to two places:\n\n1. Your secrets/vars file as \"API_SECRET\"'
[ $AUTO_ADDED == true ] && printf ' (this was done for you)'
printf '\n2. In your spreadsheet, open the Add-Ons > Publish via Bootlegger > Configuration and save it there'
printf '\n'