#!/bin/bash

SECRET=$(python -c 'import random; print("".join([random.choice("abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)") for i in range(50)]))' | base64)
echo "API_SECRET=$SECRET" >> .env

printf "New API Secret: %s" "$SECRET"
printf '\n\nAdd this key to two places:\n\n1. Your secrets/vars file as \"API_SECRET\" (this was done for you)'
printf '\n2. In your spreadsheet, open the Add-Ons > Publish via Bootlegger > Configuration and save it there'
printf '\n'