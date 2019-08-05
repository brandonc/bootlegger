## Overview

This Google Sheets script can be bound to a controller spreadsheet that can make requests to sheeyat-api to publish the contents of other spreadsheets as JSON.

The JSON shape is defined by SQL contained in the spreadsheet this script is bound to.

## Installation

`npm install`

#### Binding apps-script

This script should be bound to a Google Spreadsheet that is copied from this template https://docs.google.com/spreadsheets/d/1TOHNH2mR0RovUyoUx081WSgwqLTDNV24syjSGeR5VG0/edit#gid=0

`npx clasp create --parentId <id> --title "Publish via Sheeyat"`

The <id> can be found in the spreadsheet URL of your copy: https://docs.google.com/spreadsheets/d/&lt;id&gt;/edit

Once bound, the spreadsheet should contain a menu item under Add-ons called "Publish via Sheeyat" which contains two actions: "Configure" and "Publish to Web"

#### Security

In order for your published spreadsheets to be readable by the backend, they must be _shared with_ the service account you set up during the installation of the api server. This is accomplished by clicking the "Share" button and typing the email address of the service account.

#### Configuration

Open the `Add-Ons > Publish via Sheeyat > Configure` action and type in the host URL for the backend as well as the secret you established during setup.
