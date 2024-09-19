docker exec -it ksqldb ksql -f /ksql-queries.sql
curl -X POST -H "Content-Type:application/json" -d @mongodb-sink-connector-1.config.json localhost:8083/connectors -w "\n"
curl -X POST -H "Content-Type:application/json" -d @mongodb-sink-connector-2.config.json localhost:8083/connectors -w "\n"
curl -X POST -H "Content-Type:application/json" -d @debezium-connector.config.json localhost:8083/connectors -w "\n"