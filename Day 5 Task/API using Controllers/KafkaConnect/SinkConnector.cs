using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using KafkaConnect.Models;
using MongoDB.Driver;

namespace KafkaConnect.Sink{
    class SinkConnector{

        static int ConnectorCount = 0;
        static int MaxConnectorCount = 1;

        public IMongoCollection<Sheet> SheetCollection;
        public int ConnectorId;

        public SinkConnector(string topic, string groupId)
        {
            ConnectorId = ConnectorCount++;
            var config = new ConsumerConfig
            {
                // Fixed properties
                GroupId         = groupId,
                // User-specific properties that you must set
                BootstrapServers = "localhost:9092",
                AutoOffsetReset = AutoOffsetReset.Earliest,
            };

            // mongodb connection
            var mongoClient = new MongoClient("mongodb://localhost:27017");
            var dbName = mongoClient.GetDatabase("task5");
            SheetCollection = dbName.GetCollection<Sheet>("sheets");

            CancellationTokenSource cts = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) => {
                e.Cancel = true; // prevent the process from terminating.
                cts.Cancel();
            };

            using (var consumer = new ConsumerBuilder<byte[], byte[]>(config).Build())
            {
                consumer.Subscribe(topic);
                Console.WriteLine($"{ConnectorId} Listening");
                try
                {
                    while (true) {
                        var cr = consumer.Consume(cts.Token);
                        // Deserialize message value from byte array to string
                        if(cr.Message.Value!=null){
                            
                        var jsonString = Encoding.UTF8.GetString(cr.Message.Value);
                        // Console.WriteLine(jsonString);
                        // Convert JSON string to custom object
                        var jelement = JsonSerializer.Deserialize<KafkaConnectModelValue>(jsonString);
                        if(jelement.op!="d"){
                            // Console.WriteLine("new or changed row..");
                            // Console.WriteLine(jelement.after);
                            var afterData = JsonSerializer.Deserialize<Sheet>(jelement.after);
                            // Console.WriteLine(afterData);
                            if(jelement.op=="c"||jelement.op=="r"){
                                // insert
                                // await SheetCollection.InsertOneAsync(afterData);
                                SheetCollection.InsertOne(afterData);
                                consumer.Commit(cr);
                            }
                            else if(jelement.op=="u"){
                                // update
                                var filter = Builders<Sheet>.Filter.Where(item => item.Email_Id==afterData.Email_Id && item.Sheet_Id==afterData.Sheet_Id);
                                SheetCollection.ReplaceOne(filter,afterData);
                                consumer.Commit(cr);
                            }
                            // Console.WriteLine();
                        }
                        else{
                            Console.WriteLine("deleting row...");
                            // collection.DeleteOne(x=>x.Sheet_Id==)
                            var keyString = Encoding.UTF8.GetString(cr.Message.Key);
                            Console.WriteLine("key:"+keyString);
                            var keyElement = JsonSerializer.Deserialize<KafkaConnectModelKey>(keyString);
                            Console.WriteLine(keyElement.Email_Id);
                            Console.WriteLine(string.IsNullOrEmpty(keyElement.Email_Id));
                            Console.WriteLine($"Email:{keyElement.Email_Id}, Sheet:{keyElement.Sheet_Id}");
                            var filter = Builders<Sheet>.Filter.Where(item => item.Email_Id==keyElement.Email_Id && item.Sheet_Id==keyElement.Sheet_Id);
                            SheetCollection.DeleteOne(filter);
                                consumer.Commit(cr);
                        }
                        // var messageValue = JsonSerializer.Deserialize<JsonElement>(jsonString);
                        // Console.WriteLine();
                        // string json = messageValue.after.GetRawText();
                        // Console.WriteLine(string.IsNullOrWhiteSpace(json)||string.IsNullOrEmpty(json));
                        // Console.WriteLine("New  operation : "+messageValue.op);
                        // Console.WriteLine(messageValue.op=="d");


                        // Deserialize JSON string to custom object
                        // if(messageValue.op!="d"){
                        //     var messageValueAfter = JsonSerializer.Deserialize<Sheet?>(json);
                        //     Type type = messageValueAfter.GetType();

                        //     // Get all properties of the type
                        //     PropertyInfo[] properties = type.GetProperties();

                        //     foreach (PropertyInfo property in properties)
                        //     {
                        //         // Get the name of the property
                        //         string propertyName = property.Name;

                        //         // Get the value of the property for the given object
                        //         object propertyValue = property.GetValue(messageValueAfter);

                        //         // Print the property name and value
                        //         Console.WriteLine($"{propertyName}: {propertyValue}");
                        //     }
                        // }
                        }
                    }
                }
                catch (OperationCanceledException) {
                    // Ctrl-C was pressed.
                }
                finally{
                    consumer.Close();
                }
            }


        }

        static void Main(string[] args){
            for (int i = 0; i < SinkConnector.MaxConnectorCount; i++)
            {
                Console.WriteLine("New Connector");
                new SinkConnector("dbserver1.task5.sheets","kafka-connector");
            }
        }
    }
}