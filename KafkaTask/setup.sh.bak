# Preparing network
# docker network create kafka-net

# Zookeeper
docker run -d --rm --name zookeeper \
  -p 2181:2181 \
  -p 2888:2888 \
  -p 3888:3888 \
  quay.io/debezium/zookeeper:1.9

# Kafka
docker run -d --rm --name kafka \
  -p 9092:9092 \
  --link zookeeper:zookeeper \
  quay.io/debezium/kafka:1.9

# Kafka Connect
docker run -d --rm --name connect \
  -p 8083:8083 \
  -e GROUP_ID=1 \
  -e CONFIG_STORAGE_TOPIC=my_connect_configs \
  -e OFFSET_STORAGE_TOPIC=my_connect_offsets \
  -e STATUS_STORAGE_TOPIC=my_connect_statuses \
  --volume ./mongodb-kafka-connect-mongodb-1.13.0:/kafka/connect/mongodb-kafka-connect-mongodb-1.13.0 \
  --link kafka:kafka \
  quay.io/debezium/connect:1.9

# KSQLDB
docker run -d --rm --name ksqldb\
  -p 8088:8088 \
  -e KSQL_BOOTSTRAP_SERVERS=172.17.0.4:9092 \
  --volume ./ksql-queries.sql:/ksql-queries.sql \
  confluentinc/ksqldb-server:0.29.0

# Kafka UI
docker run -d --rm --name kafka-ui \
  -p 8080:8080 \
  -e DYNAMIC_CONFIG_ENABLED=true \
  provectuslabs/kafka-ui
