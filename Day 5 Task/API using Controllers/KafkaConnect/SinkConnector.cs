using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using KafkaConnect.Models;
using MongoDB.Driver;

namespace KafkaConnect.Sink{
    class SinkConnector{

        static int ConnectorCount = 0;
        static int MaxConnectorCount = 6;

        public IMongoCollection<Sheet> SheetCollection;
        public int ConnectorId;
        public string _topic;
        public string _groupId;

        public SinkConnector(string topic, string groupId)
        {
            ConnectorId = ConnectorCount++;
            _topic = topic;
            _groupId = groupId;

            // mongodb connection
            MongoClient mongoClient = new MongoClient("mongodb://localhost:27017");
            IMongoDatabase dbName = mongoClient.GetDatabase("task5");
            SheetCollection = dbName.GetCollection<Sheet>("sheets");

            // Task.Run(BeginConsumption);

        }

        public async Task BeginConsumption()
        {
            ConsumerConfig config = new ConsumerConfig
            {
                // Fixed properties
                GroupId         = _groupId,
                // User-specific properties that you must set
                BootstrapServers = "localhost:9092",
                AutoOffsetReset = AutoOffsetReset.Earliest,
            };
            CancellationTokenSource cts = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) => {
                e.Cancel = true; // prevent the process from terminating.
                cts.Cancel();
            };
            using (IConsumer<byte[], byte[]> consumer = new ConsumerBuilder<byte[], byte[]>(config).Build())
            {
                consumer.Subscribe(_topic);
                Console.WriteLine($"{ConnectorId} Listening");
                try
                {
                    while (true) {
                        var cr = consumer.Consume(cts.Token);
                        // if(cr.Message.Value!=null){
                            // Deserialize message value from byte array to string
                            if(cr.Message.Value == null){continue;}
                            var jsonString = Encoding.UTF8.GetString(cr.Message.Value);
                            // Convert JSON string to custom object
                            var jelement = JsonSerializer.Deserialize<KafkaConnectModelValue>(jsonString);
                            if(jelement==null){
                                //Empty Message
                                Console.WriteLine("Empty Message");
                            }
                            else{
                                if(jelement.op=="c"||jelement.op=="r"){
                                    // insert
                                    // Console.WriteLine("insert");
                                    var afterData = JsonSerializer.Deserialize<Sheet>(jelement.after);
                                    if(afterData!=null){await SheetCollection.InsertOneAsync(afterData);}
                                    // consumer.Commit(cr);
                                }
                                else if(jelement.op=="u"){
                                    // update
                                    // Console.WriteLine("update");
                                    var afterData = JsonSerializer.Deserialize<Sheet>(jelement.after);
                                    if(afterData!=null)
                                    {
                                        var filter = Builders<Sheet>.Filter.Where(item => item.Email_Id==afterData.Email_Id && item.Sheet_Id==afterData.Sheet_Id);
                                        await SheetCollection.ReplaceOneAsync(filter,afterData);
                                    }
                                    // consumer.Commit(cr);
                                }
                                else if(jelement.op=="d"){
                                    // Console.WriteLine("deleting row...");
                                    var keyString = Encoding.UTF8.GetString(cr.Message.Key);
                                    var keyElement = JsonSerializer.Deserialize<KafkaConnectModelKey>(keyString);
                                    if(keyElement!=null){
                                        var filter = Builders<Sheet>.Filter.Where(item => item.Email_Id==keyElement.Email_Id && item.Sheet_Id==keyElement.Sheet_Id);
                                        await SheetCollection.DeleteOneAsync(filter);
                                    }
                                    // consumer.Commit(cr);
                                }
                            }
                        // }
                    }
                }
                catch (OperationCanceledException) {
                    // Ctrl-C was pressed.
                }
                catch (Exception e) {
                    Console.WriteLine("Exception occurred");
                    Console.WriteLine(e);
                }
                finally{
                    consumer.Close();
                }
            }
        }

        static async Task Main(string[] args){
            List<Task> tasks = [];
            for (int i = 0; i < SinkConnector.MaxConnectorCount; i++)
            {
                Console.WriteLine("New Connector");
                SinkConnector sinkConnector = new SinkConnector("dbserver1.task5.sheets","kafka-connector");
                tasks.Add(Task.Run(sinkConnector.BeginConsumption));
            }
            await Task.WhenAll(tasks);
        }
    }
}