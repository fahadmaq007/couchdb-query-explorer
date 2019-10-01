ng build --prod --base-href "/couchdb-query-explorer/"
rm -rf docker/dist
mv dist docker/

REG_IP=maqboolahmed
MODULE=couchdb-query-explorer
VERSION=0.6
docker build -t $MODULE ./docker
docker tag $MODULE:latest $REG_IP/$MODULE:$VERSION
docker push $REG_IP/$MODULE:$VERSION

