# couchdb-query-explorer
The 'couchdb-query-explorer' helps to query the <a href="https://docs.couchdb.org/en/stable/index.html" target="_blank">CouchDB NoSQL Database</a> easily.


How to build it?
***************
It is an Angular 7 project, run the usual commands:

npm install

ng serve (runs a local server on port 4200)

./docker-build.sh (creates a production build & bundles it in a docker image - make sure you have put right version)


Not a developer?
******************
If you are just interested in running the application, do the following: 

Step 1: ./docker-run.sh (runs the image in your local machine on port 8855 - make sure you have put right version)

Step 2: Launch http://localhost:8855/couchdb-query-explorer

Note: The docker images have been published to docker hub at https://cloud.docker.com/repository/docker/maqboolahmed/couchdb-query-explorer, refer the link to find more about the tags & versions.


How to use the app?
******************
It's relatively a simple & an intuitive tool to query the CouchDB. The detailed description is here: https://medium.com/@maqbool.ahmed.mca/https-medium-com-maqbool-ahmed-mca-couchdb-query-explorer-84887827e11
