# couchdb-query-explorer
The 'couchdb-query-explorer' helps to query the <a href="https://docs.couchdb.org/en/stable/index.html" target="_blank">CouchDB NoSQL Database</a> easily.

***************

<b>How to build it?</b>

It is an Angular 7 project, run the usual commands:

npm install

ng serve (runs a local server on port 4200)

./docker-build.sh (creates a production build & bundles it in a docker image - make sure you have put right version)

******************

<b>Not a developer?</b>

If you are just interested in running the application, do the following: 

Step 1: ./docker-run.sh (runs the image in your local machine on port 8855 - make sure you have put right version)

Step 2: Launch http://localhost:8855/couchdb-query-explorer

Note: The docker images have been published to <a href="https://cloud.docker.com/repository/docker/maqboolahmed/couchdb-query-explorer" target="_blank">docker hub</a>, refer the link to find more about the tags & versions.

******************

<b>How to use the app?</b>

It's relatively a simple & an intuitive tool to query the CouchDB. The detailed description is <a href="https://medium.com/@maqbool.ahmed.mca/https-medium-com-maqbool-ahmed-mca-couchdb-query-explorer-84887827e11" target="_blank">here</a>.
