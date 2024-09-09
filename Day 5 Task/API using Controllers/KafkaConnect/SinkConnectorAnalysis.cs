using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using KafkaConnect.Models;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

//calculate the current aggregate into static variables and 
// recalculate at each change
// insert - add to total age and update all 3
// delete - subtract from total age and update all 3
// update - update the total change and update all 3

namespace KafkaConnect.Sink{
    class SinkConnectorAnalysis{

        static int ConnectorCount = 0;
        static int MaxConnectorCount = 1;

        // stats for age aggregates
        static int TotalAge=0;
        static int MaxAge=int.MinValue;
        static int MinAge=int.MaxValue;
        static float AverageAge = 0;
        static int TotalRecordCount=0;

        public IMongoCollection<SheetMongoModel> SheetCollection;
        public IMongoCollection<Report> Reports;
        
        public int? ConnectorId=null;
        public string? _topic=null;
        public string? _groupId=null;

        public Report prevReport;

        public SinkConnectorAnalysis(string topic, string groupId)
        {
            ConnectorId = ConnectorCount++;
            _topic = topic;
            _groupId = groupId;

            // mongodb connection
            MongoClient mongoClient = new MongoClient("mongodb://localhost:27017");
            IMongoDatabase dbName = mongoClient.GetDatabase("task5");
            SheetCollection = dbName.GetCollection<SheetMongoModel>("sheets");
            Reports = dbName.GetCollection<Report>("reports");
            prevReport = Reports.AsQueryable().Where(x=>true).FirstOrDefault();
            if(prevReport==null){
                prevReport = new Report();
                Reports.InsertOne(prevReport);
            }
            MaxAge = prevReport.MaxAge;
            MinAge = prevReport.MinAge;
            AverageAge = prevReport.AverageAge;
            TotalRecordCount = prevReport.TotalRecordCount;
            Console.WriteLine($"MaxAge:{MaxAge} MinAge:{MinAge} AverageAge:{AverageAge} Count:{TotalRecordCount}");
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
                                    var afterData = JsonSerializer.Deserialize<SheetMessage>(jelement.after);
                                    if(afterData!=null){
                                        SheetMongoModel s = afterData.ToMongoModel();
                                        int yearGap=0;
                                        // Report prevReport = Reports.AsQueryable().Where(x=>true).FirstOrDefault();
                                        // Console.WriteLine($"MaxAge : {prevReport.MaxAge}, MinAge:{prevReport.MinAge}, AverageAge:{prevReport.AverageAge}");
                                        if(s.Date_of_Birth!=null){
                                            yearGap = DateTime.Now.Year - ((DateTime)s.Date_of_Birth).Year;
                                        }
                                        TotalRecordCount++;
                                        TotalAge+=yearGap;
                                        if(MaxAge<yearGap){
                                            MaxAge=yearGap;
                                        }
                                        if(MinAge>yearGap){
                                            MinAge=yearGap;
                                        }
                                        AverageAge = (float)TotalAge/TotalRecordCount;
                                        // Console.WriteLine(AverageAge);
                                        await SheetCollection.InsertOneAsync(s);
                                        Report newReport = new Report{AverageAge=AverageAge, MaxAge=MaxAge, MinAge=MinAge, TotalRecordCount=TotalRecordCount, Id=prevReport.Id};
                                        await Reports.FindOneAndReplaceAsync(x=>x.Id==prevReport.Id,newReport);
                                        prevReport = newReport;
                                    }
                                    
                                    // consumer.Commit(cr);
                                }
                                else if(jelement.op=="u"){
                                    // update
                                    // Console.WriteLine("update");
                                    var afterData = JsonSerializer.Deserialize<SheetMessage>(jelement.after);
                                    var beforeData = JsonSerializer.Deserialize<SheetMessage>(jelement.before);
                                    if(afterData!=null && beforeData!=null)
                                    {
                                        var afterModel = afterData.ToMongoModel();
                                        var beforeModel = beforeData.ToMongoModel();
                                        int yearGap=0;
                                        // Report prevReport = Reports.AsQueryable().Where(x=>true).FirstOrDefault();
                                        // Console.WriteLine($"MaxAge : {prevReport.MaxAge}, MinAge:{prevReport.MinAge}, AverageAge:{prevReport.AverageAge}");
                                        var filter = Builders<SheetMongoModel>.Filter.Where(item => item.Email_Id==afterData.Email_Id && item.Sheet_Id==afterData.Sheet_Id);
                                        await SheetCollection.ReplaceOneAsync(filter,afterData.ToMongoModel());
                                        if(afterModel.Date_of_Birth!=null){
                                            yearGap += DateTime.Now.Year - ((DateTime)afterModel.Date_of_Birth).Year;
                                        }
                                        if(beforeModel.Date_of_Birth!=null){
                                            yearGap -= DateTime.Now.Year - ((DateTime)beforeModel.Date_of_Birth).Year;
                                        }
                                        TotalAge+=yearGap;
                                        AverageAge = (float)TotalAge/TotalRecordCount;
                                        // await Reports.ReplaceOneAsync(x=>x.AverageAge==prevReport.AverageAge, new Report{AverageAge=AverageAge, MaxAge=MaxAge, MinAge=MinAge});
                                        Report newReport = new Report{AverageAge=AverageAge, MaxAge=MaxAge, MinAge=MinAge, TotalRecordCount=TotalRecordCount, Id=prevReport.Id};
                                        await Reports.FindOneAndReplaceAsync(x=>x.Id==prevReport.Id,newReport);
                                        prevReport = newReport;
                                    }
                                    // consumer.Commit(cr);
                                }
                                else if(jelement.op=="d"){
                                    // Console.WriteLine("deleting row...");
                                    var keyString = Encoding.UTF8.GetString(cr.Message.Key);
                                    var keyElement = JsonSerializer.Deserialize<KafkaConnectModelKey>(keyString);
                                    var beforeData = JsonSerializer.Deserialize<SheetMessage>(jelement.before);
                                    Report prevReport = Reports.AsQueryable().Where(x=>true).FirstOrDefault();
                                    if(keyElement!=null && beforeData!=null){
                                        var beforeModel = beforeData.ToMongoModel();
                                        int yearGap = 0;
                                        if(beforeModel.Date_of_Birth!=null){
                                            yearGap = DateTime.Now.Year - ((DateTime)beforeModel.Date_of_Birth).Year;
                                        }
                                        TotalAge-=yearGap;
                                        TotalRecordCount--;
                                        AverageAge = (float)TotalAge/TotalRecordCount;
                                        var filter = Builders<SheetMongoModel>.Filter.Where(item => item.Email_Id==keyElement.Email_Id && item.Sheet_Id==keyElement.Sheet_Id);
                                        await SheetCollection.DeleteOneAsync(filter);
                                        DateTime? oldest = SheetCollection.Find(x=>x.Date_of_Birth!=null).SortBy(x=>x.Date_of_Birth).FirstOrDefault().Date_of_Birth;
                                        Console.WriteLine(oldest);
                                        if(oldest!=null){
                                            MaxAge = DateTime.Now.Year - ((DateTime)oldest).Year;
                                        }
                                        var youngest = SheetCollection.AsQueryable().Where(x=>x.Date_of_Birth!=null).OrderByDescending(x=>x.Date_of_Birth).FirstOrDefault().Date_of_Birth;
                                        if(youngest!=null){
                                            MinAge = DateTime.Now.Year - ((DateTime)youngest).Year;
                                        }
                                        // await Reports.ReplaceOneAsync(x=>x.AverageAge==prevReport.AverageAge, new Report{AverageAge=AverageAge, MaxAge=MaxAge, MinAge=MinAge});
                                        Report newReport = new Report{AverageAge=AverageAge, MaxAge=MaxAge, MinAge=MinAge, TotalRecordCount=TotalRecordCount, Id=prevReport.Id};
                                        await Reports.FindOneAndReplaceAsync(x=>x.Id==prevReport.Id,newReport);
                                        prevReport = newReport;

                                    }
                                    // consumer.Commit(cr);
                                }
                            }
                        // }
                    }
                }
                catch (OperationCanceledException) {
                    Console.WriteLine($"MaxAge : {MaxAge}, MinAge:{MinAge}, AverageAge:{AverageAge}");
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
            for (int i = 0; i < SinkConnectorAnalysis.MaxConnectorCount; i++)
            {
                Console.WriteLine("New Connector");
                SinkConnectorAnalysis sinkConnector = new SinkConnectorAnalysis("dbserver1.task5.Sheets","kafka-connector");
                tasks.Add(Task.Run(sinkConnector.BeginConsumption));
            }
            await Task.WhenAll(tasks);
            Console.WriteLine($"MaxAge : {MaxAge}, MinAge:{MinAge}, AverageAge:{AverageAge}");
        }
    }
}
