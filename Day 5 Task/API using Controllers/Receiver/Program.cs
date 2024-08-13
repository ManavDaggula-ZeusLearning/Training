using System.Globalization;
using System.Text;
using CsvHelper;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Tasks.Model;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

Console.WriteLine(" [*] Waiting for messages.");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    if(File.Exists(message)){
        var todoContext = new TodoContext();
        using (var reader = new StreamReader(message))
        using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
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

            var countOfRecordsInAChunk = 3;
            var currentCount = 0;
            var chunkCount = 0;
            var records = csv.GetRecords<Todo>();
            List<Todo> newTasks = new();

            foreach (var item in records)
            {
                if(item.Id!=string.Empty && todoContext.Todos.Find(item.Id)==null){
                    newTasks.Add(item);
                    // todoContext.SaveChanges();
                }
                currentCount++;
                if(currentCount==countOfRecordsInAChunk){
                    todoContext.AddRange(newTasks);
                    todoContext.SaveChanges();
                    newTasks.Clear();
                    Console.WriteLine($"saved chunk {chunkCount}");
                    Thread.Sleep(3000);
                    currentCount=0;
                    chunkCount++;
                }
            }
            if(currentCount!=0){
                todoContext.AddRange(newTasks);
                todoContext.SaveChanges();
                Console.WriteLine($"saved chunk {chunkCount}");
                // Thread.Sleep(3000);
                chunkCount++;
            }
            Console.WriteLine(chunkCount);
        }
        File.Delete(message);
    }
    Console.WriteLine($" [x] Received {message}");
    
};
channel.BasicConsume(queue: "hello",
                     autoAck: true,
                     consumer: consumer);

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();