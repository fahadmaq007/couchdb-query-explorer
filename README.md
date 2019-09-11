# couchdb-query-explorer
The 'couchdb-query-explorer' helps to query the <a href="https://docs.couchdb.org/en/stable/index.html" target="_blank">CouchDB NoSQL Database</a> easily.

Why another query explorer:
**************************
The fauxton UI that comes with Apache CouchDB v2.0 & above is not very easy to use, hence we started thinking about something which should be easy to configure & use. 

For more details about the Fauxton, refer https://docs.couchdb.org/en/stable/fauxton/install.html#fauxton-visual-guide

How to run it?
*************
It has been published to docker hub at https://cloud.docker.com/repository/docker/maqboolahmed/couchdb-query-explorer, refer the link to find more about the tags & versions.

Step 1: docker run -d --name=couchdb-explorer -p 8855:80 maqboolahmed/couchdb-query-explorer:$tagname

Step 2: Launch http://localhost:8855/couchdb-query-explorer/query

How to use the app?
******************
It's relatively a simple & an intuitive tool to query the CouchDB Database. It uses the browser's localStorage to store the metadata user creates & hence you don't need to re-create it again & again.


