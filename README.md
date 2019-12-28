<p align="center">
  A Google Sheets integration and API server that transforms a spreadsheet into JSON and uploads it to the ☁️</p>
<p align="center"><img src="https://roosterhappyhours.sfo2.cdn.digitaloceanspaces.com/SS_Banshee.jpg" width="400" /></p>

---

## Overview

bootlegger is a Google Sheets toolchain that can transform a Google Spreadsheet into a set of JSON file(s) and upload them to S3-compatible cloud storage. It is composed of two parts:

1. A Google Apps script that is meant to run on a spreadsheet duplicated from [this template](https://docs.google.com/spreadsheets/d/1TOHNH2mR0RovUyoUx081WSgwqLTDNV24syjSGeR5VG0/edit#gid=0). The spreadsheet acts as a controller that can publish any number of spreadsheets that it links to. See the [section below](#sheets-script-ui-installation) for setup instructions

2. An API server that the script communicates with to execute a transformation pipeline. The API server is configured with a Google service account that should be given access to the spreadsheets that it transforms. See the [section below](#api--worker-installation) for setup instructions

## Transformation

The spreadsheet transformation consists of two parts:

1. Converting the Google Spreadsheet into a SQLite database

2. Performing a SELECT projection that converts the sheets into a JSON object (or array). This query is stored within the spreadsheet (see above) and should be modified to fit the shape of your exported spreadsheet.

## Publishing

Once the spreadsheet is converted into JSON file(s), those are compressed and uploaded to an S3 (compatible) cloud store along with a manifest that lists them. The manifest has the useful property of having a predictable name so that client applications can fetch it and follow links to the newest published data.

## sheets-script-ui Installation

#### Installation

Change to the sheets-script-ui directory, run `npm install`, and follow the installation instructions for [Google clasp](https://github.com/google/clasp)

Bind the script to a Google Spreadsheet that is copied from [this template](https://docs.google.com/spreadsheets/d/1TOHNH2mR0RovUyoUx081WSgwqLTDNV24syjSGeR5VG0/edit#gid=0)

`npx clasp create --parentId <id> --title "Publish via Bootlegger"`

The `<id>` can be found in the spreadsheet URL of your copy: `https://docs.google.com/spreadsheets/d/<id>/edit`

Now push the scripts to the script container:

`npx clasp push`

Once bound, the spreadsheet should contain a menu item under Add-ons called "Publish via Bootlegger" which contains two actions: "Configure" and "Publish to Web"

#### Security

In order for your published spreadsheets to be readable by the backend, they must be _shared with_ the service account you set up during the installation of the api server. This is accomplished by clicking the "Share" button and typing the email address of the service account.

#### Configuration

Open the `Add-Ons > Publish via Bootlegger > Configure` action and type in the host URL for the backend as well as the secret you established during setup.

## api & worker Installation

A node (express) API server that queues a job and a node (faktory) worker that downloads and transforms a Google spreadsheet, uploading the resulting JSON documents to S3.

#### On Digital Ocean

The easiest way to deploy the cluster is using docker on a cloud provider such as digitalocean. In this example, we'll create a new droplet called bootlegger-cluster then build and run the containers on it. Make sure you have docker installed locally before beginning the installation and your working directory is the root folder where this README is found.

**Create the docker host droplet**

Uses [docker machine](https://docs.docker.com/machine/) to provision a docker host on digitalocean.

`docker-machine create --driver digitalocean --digitalocean-access-token <ACCESS TOKEN> --digitalocean-size s-2vcpu-2gb bootlegger-cluster`

**Configure your shell to use the docker host**

`eval $(docker-machine env bootlegger-cluster)`

This only works for the current terminal session. To always use this docker host, add this command to your bash profile.

**SSH into your droplet**

`docker-machine ssh bootlegger-cluster`

**Creating a Google Service Account**

Follow [these instructions](https://support.google.com/a/answer/7378726?hl=en) to create a service account, ensuring that you choose "JSON" as the key type. Select "Project" > "Viewer" as the Role.

Within your Google API Project, you should also enable the Google Drive API and Google Sheets API here: https://console.developers.google.com/apis

**Create the required secrets locally and copy them to your server**

Move the json file created with the service account to the file `secrets/gs.json`

Copy the file `.env.template` to `.env` and fill in all the values. Make up something new for FAKTORY_PASSWORD. This file will be added to the docker container's ENV via docker compose.

From the root directory, run `npm run generatesecret` to create a new API shared secret and follow the instructions given.

Securely copy the secrets to your droplet into a folder called /app/secrets:

`scp -i ~/.docker/machine/machines/bootlegger-cluster/id_rsa -r ./secrets/gs.json root@<ip>:/var/lib/bootlegger/secrets/`

**Builds, creates, and starts the containers**

Use `docker-compose -f docker-compose.yml -f production.yml up -d` to create and run all services

**Try it out!**

`curl http://<ip>/health`

You should see "OK" if the server is running

## Troubleshooting

You probably won't see errors when publishing, but well after the fact. To diagnose broken jobs, try going to the faktory dashboard: `http://:<FAKTORY_PASSWORD>@<ip>:7420`
  
You can also examine logs using `docker-compose logs -f`

## Development

bootlegger requires a few local system dependencies before it will work:

1. python 3.6 (and pip)

2. sqlite (`brew install sqlite` or `apt-get install sqlite`)

3. faktory ([installation](https://github.com/contribsys/faktory/wiki/Installation))

4. sqlitebiter w/ google sheets extensions: (`pip install sqlitebiter[gs]`)

Once your dependencies are installed, just `npm install` and `npm start` to get started
