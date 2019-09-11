# couchdb-query-explorer
The 'couchdb-query-explorer' helps to query the <a href="https://docs.couchdb.org/en/stable/index.html" target="_blank">CouchDB NoSQL Database</a> easily.


Why another query explorer:
**************************
The fauxton UI that comes with Apache CouchDB v2.0 & above is not very easy to use, hence I started thinking about something which should be easy to configure & use. 

For more details about the Fauxton, refer https://docs.couchdb.org/en/stable/fauxton/install.html#fauxton-visual-guide


How to run it?
*************
It has been published to docker hub at https://cloud.docker.com/repository/docker/maqboolahmed/couchdb-query-explorer, refer the link to find more about the tags & versions.

Step 1: docker run -d --name=couchdb-explorer -p 8855:80 maqboolahmed/couchdb-query-explorer:$tagname

Step 2: Launch http://localhost:8855/couchdb-query-explorer/query


How to use the app?
******************
It's relatively a simple & an intuitive tool to query the CouchDB. 

Features:
********

1. Settings: The launch of the application is 'Query Explorer' and if you are setting up the application for the first time, go to Settings page by clicking 'Settings' icon on the top right corner and provide details like CouchDB. (For eg. URL). You can also create common fields and the filters you generally deal with. 

   a. Field: It's a free text input, key in the attribute name & Click on <i>Add Field</i>.
   
   b. Filter: Click on <i>Add Filter</i> & provide details like the field (attributeName), operation (eq, regex, gte, lte), value and optional name to it.
   
   c. Import Settings: Paste the JSON format of the settings metadata & hit Enter. For eg. ``` {"couchUrl":"http://localhost:5984","fields":["_id","type","channel","parentId"],"filters":[{"field":"type","operation":"$eq","value":""}],"operations":{"$eq":"is","$regex":"contains","$gt":"greater than","$lt":"less than"}}```
   
   d. Export Settings: As name suggests, the action will copy the settings metadata.
   
   
The setting configuration data is stored in browser's localStorage so you don't have to re-create them.

2. Query Explorer: It is as simple as selecting the available filters to query the database. However, if you want change the value of the filter, click on it.

Note: The filter value that is changed here will be temporary and will not be persisted.
