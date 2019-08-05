## Overview

A node (express) API server that downloads and transforms a Google Spreadsheet, uploading the resulting JSON documents to S3.

## Installation (Digital Ocean + Docker)

The easiest way to deploy the API server is using docker on a cloud provider such as digitalocean. In this example, we'll create a new droplet called sheeyat-api then build and run the API server on it. Make sure you have docker installed locally before beginning the installation and your working directory is the "api" folder where this README is found.

**Create the docker host droplet**

Uses [docker machine](https://docs.docker.com/machine/) to provision a docker host on digitalocean.

`docker-machine create --driver digitalocean --digitalocean-access-token <ACCESS TOKEN> sheeyat-api`

**Configure your shell to use the docker host**

`eval $(docker-machine env sheeyat-api)`

This only works for the current terminal session. To always use this docker host, add this command to your bash profile.

**Build the API server and install its dependencies**

`docker build -f Dockerfile . -t sheeyat:api`

This process takes a few minutes while the new droplet downloads the base image, builds the sheeyat package, and installs the system dependencies (sqlite, python, and sqlitebiter)

**Create the required secrets locally and copy them to your server**

`mdkir secrets`

**Creating a Google Service Account**

Follow [these instructions](https://support.google.com/a/answer/7378726?hl=en) to create a service account, ensuring that you choose "JSON" as the key type. Select "Project" > "Viewer" as the Role.

Move the json file into a file called `secrets/gs.json`

Create a new file called `secrets/vars` with the following contents. This file will be added to the docker container's ENV.

```
AWS_ACCESS_KEY_ID=<access key id>
AWS_SECRET_ACCESS_KEY=<secret access key>
S3_BUCKET_NAME=<s3 bucket name>
S3_ENDPOINT=<s3 endpoint, example: "sfo2.digitaloceanspaces.com">
```

Securely copy the secrets to your droplet into a folder called /srv/sheeyat:

`ssh -i ~/.docker/machine/machines/sheeyat-api/id_rsa root@<ip> 'mkdir -p /srv/sheeyat/secrets'`
`scp -i ~/.docker/machine/machines/sheeyat-api/id_rsa -r ./secrets/* root@<ip>:/srv/sheeyat/secrets/`

**Run the container**

This also maps port 3000 to host port 80, sets a restart policy, and mounts the secrets folder as a volume:

`docker run -v "/srv/sheeyat/secrets:/app/secrets" -p 80:3000 --restart=always -d sheeyat:api`

**Try it out!**

`curl http://<ip>/health`

You should see "OK" if the server is running

## Development

sheeyat-api requires a few local system dependencies before it will work:

1. python 3.6 (and pip)

2. sqlite

`brew install sqlite` or `apt-get install sqlite`

3. sqlitebiter w/ google sheets extensions:

`pip install sqlitebiter[gs]`

Once your dependencies are installed, just `npm install` and `npm run build` to get started
