# Overview

Sheeyat is a Google Spreadsheets toolchain that can transform a Google Spreadsheet into a set of JSON file(s) and upload them to S3-compatible cloud storage. It is composed of two parts:

1. A Google Apps script that is meant to run on a spreadsheet duplicated from (this template)[https://docs.google.com/spreadsheets/d/1TOHNH2mR0RovUyoUx081WSgwqLTDNV24syjSGeR5VG0/edit#gid=0]. The spreadsheet acts as a controller that can publish any number of spreadsheets that it links to.

2. An API server that the script communicates with to execute a transformation pipeline. The API server is configured with a Google service account that should be given access to the spreadsheets that it transforms.

## Transformation

The spreadsheet transformation consists of two parts:

1. Converting the Google Spreadsheet into a SQLite database

2. Performing a SELECT projection that converts the sheets into a JSON object (or array). This query is stored within the spreadsheet (see above) and should be modified to fit the shape of your exported spreadsheet.

## Publishing

Once the spreadsheet is converted into JSON file(s), those are compressed and uploaded to an S3 (compatible) cloud store along with a manifest that lists them. The manifest has the useful property of having a predictable name so that client applications can fetch it and follow links to the newest published data.
