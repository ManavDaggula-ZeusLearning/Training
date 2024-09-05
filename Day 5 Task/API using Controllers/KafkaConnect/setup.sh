sudo docker run -d --rm --name zookeeper -p 2181:2181 -p 2888:2888 -p 3888:3888 quay.io/debezium/zookeeper:1.9
#
sudo docker run -d --rm --name kafka -p 9092:9092 \
--link zookeeper:zookeeper quay.io/debezium/kafka:1.9
# -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 \
# -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
#
sudo docker run -d --rm --name connect -p 8083:8083 -e GROUP_ID=1 -e CONFIG_STORAGE_TOPIC=my_connect_configs -e OFFSET_STORAGE_TOPIC=my_connect_offsets -e STATUS_STORAGE_TOPIC=my_connect_statuses --link kafka:kafka quay.io/debezium/connect:1.9
#
sudo docker run -d --rm --name kafka-ui -p 8080:8080 -e DYNAMIC_CONFIG_ENABLED=true provectuslabs/kafka-ui