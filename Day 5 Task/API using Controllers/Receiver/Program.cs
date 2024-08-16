using System.Globalization;
using System.Text;
using CsvHelper;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Tasks.Model;
using Receiver;
using System.Diagnostics;
using Sheets.Model;
using CsvHelper.Configuration;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();
var dataAccessor = new DataAccessor();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

Console.WriteLine(" [*] Waiting for messages.");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea) =>
{
    Stopwatch sw = new Stopwatch();
    Console.Write("received new file to process : ");
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    if(File.Exists(message)){
        // Console.WriteLine(message);
        var todoContext = new TodoContext();
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header.ToLower(),
        };
        using (var reader = new StreamReader(message))
        using (var csv = new CsvReader(reader, config))
        {
            /*// var records = csv.GetRecords<Todo>();
            // var records = new List<Todo>();
            // csv.Read();
            // csv.ReadHeader();
            // while (csv.Read())
            // {
            //     // Console.WriteLine(csv.GetField<int?>("Id"));
            //     // Console.WriteLine((double)reader.BaseStream.Position/reader.BaseStream.Length);
            //     Console.WriteLine(reader.BaseStream.Position/reader.BaseStream.Length);
            //     // var record = new Todo
            //     // {
            //     //     Id = csv.GetField<int>("Id"),
            //     //     Name = csv.GetField("Name")
            //     // };
            //     // records.Add(record);
            // }
            // foreach (var item in records)
            // {
            //     // Console.WriteLine(item);
            //     Console.WriteLine($"{item.Id} : {item.Name}");
            //     if(item.Id!=string.Empty && todoContext.Todos.Find(item.Id)==null){
            //         todoContext.Add(item);
            //         todoContext.SaveChanges();
            //     }
            //     Console.WriteLine((double)reader.BaseStream.Position/reader.BaseStream.Length);
            //     // Thread.Sleep(3000);
            // }*/

            // var countOfRecordsInAChunk = 10000;
            var currentCount = 0;
            var chunkCount = 0;
            var countOfRecordsInAChunk = 1000;
            // foreach (var countOfRecordsInAChunk in new List<int>{100,1000,10000,100000})
            // {
            sw.Start();
            var records = csv.GetRecords<SheetModelWithoutSheetID>();
            List<SheetModelWithoutSheetID> newTasks = new();

            foreach (var item in records)
            {
                // Console.WriteLine(item);){
                    // Console.WriteLine(item.Id);
                    // todoContext.Todos.Add(item);
                    newTasks.Add(item);
                    currentCount++;
                    if(currentCount==countOfRecordsInAChunk){
                        dataAccessor.BulkInsert(newTasks,message);
                        // todoContext.AddRange(newTasks);
                        // todoContext.SaveChanges();
                        newTasks.Clear();
                        // Console.WriteLine($"saved chunk {chunkCount}");
                        // Thread.Sleep(3000);
                        currentCount=0;
                        chunkCount++;
                    }
                }
            
            if(currentCount!=0){
                dataAccessor.BulkInsert(newTasks, message);
                // todoContext.AddRange(newTasks);
                // todoContext.SaveChanges();
                // Console.WriteLine($"saved chunk {chunkCount}");
                // Thread.Sleep(3000);
                chunkCount++;
            }
            sw.Stop();
            Console.WriteLine($"Elapsed for {countOfRecordsInAChunk}={sw.Elapsed}");
            }
            // Console.WriteLine(chunkCount);
        }
        // Thread.Sleep(3000);
        File.Delete(message);
    // }

    // Console.WriteLine($" [x] Received {message}");
    
};
channel.BasicConsume(queue: "hello",
                     autoAck: true,
                     consumer: consumer);

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();