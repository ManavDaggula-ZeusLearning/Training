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
// var dataAccessor = new DataAccessor();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

Console.WriteLine(" [*] Waiting for messages.");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += async (model, ea) =>
{
    Stopwatch sw = new Stopwatch();
    Console.Write("received new file to process : ");
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    if(File.Exists(Path.Combine("../tempFiles", message))){
        var taskList = new List<Task>();
        // var dataAccessor = new DataAccessor();
        // Console.WriteLine(message);
        // var taskList = new List<Task>();
        // var todoContext = new TodoContext();
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header.ToLower(),
        };
        using (var reader = new StreamReader(Path.Combine("../tempFiles", message)))
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
            // var currentCount = 0;
            // var chunkCount = 0;
            var countOfRecordsInAChunk = 1000;
            // foreach (var countOfRecordsInAChunk in new List<int>{100,1000,10000,100000})
            // {
            sw.Start();
            var records = csv.GetRecords<SheetModelWithoutSheetID>().ToList();
            
            List<SheetModelWithoutSheetID> newTasks = new();
            var percentageIncrementPerChunk = countOfRecordsInAChunk / (double)records.Count;
            Console.WriteLine(records.Count);
            Console.WriteLine(countOfRecordsInAChunk);
            Console.WriteLine(percentageIncrementPerChunk);

            /*for each (var item in records)
            {
                if(item.Email_Id!=string.Empty){

                    newTasks.Add(item);
                    currentCount++;
                    if(currentCount==countOfRecordsInAChunk){
                        // var dataAccessor = new DataAccessor();
                        await dataAccessor.BulkInsert(newTasks,message);
                        // todoContext.AddRange(newTasks);
                        // todoContext.SaveChanges();
                        newTasks.Clear();
                        // Console.WriteLine($"saved chunk {chunkCount}");
                        // Thread.Sleep(3000);
                        currentCount=0;
                        // chunkCount++;
                    }
                }
            }
            
            if(currentCount!=0){
                // var dataAccessor = new DataAccessor();
                await dataAccessor.BulkInsert(newTasks, message);
                // todoContext.AddRange(newTasks);
                // todoContext.SaveChanges();
                // Console.WriteLine($"saved chunk {chunkCount}");
                // Thread.Sleep(3000);
                // chunkCount++;
            } */

            for(int i=0; i<records.Count; i+=countOfRecordsInAChunk){
                var dataAccessor = new DataAccessor();
                var chunkList = records.Skip(i).Take(countOfRecordsInAChunk).ToList();
                taskList.Add(dataAccessor.BulkInsert(chunkList, message, percentageIncrementPerChunk));
            }
        }
        // Console.WriteLine(chunkCount);
        await Task.WhenAll(taskList);
        // await dataAccessor.CloseAsync();
        File.Delete(Path.Combine("../tempFiles", message));
        sw.Stop();
        Console.WriteLine($"total Elapsed for={sw.Elapsed}");
    }
        // Thread.Sleep(3000);
    // }

    // Console.WriteLine($" [x] Received {message}");
    
};
channel.BasicConsume(queue: "hello",
                     autoAck: true,
                     consumer: consumer);

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();