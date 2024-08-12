using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using BackendTrial.Server.Model;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

var thelp = new TodoHelper();
Console.WriteLine(" [*] Waiting for messages.");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Todo? t = JsonSerializer.Deserialize<Todo>(message);
    Console.WriteLine($" [x] Received {message}");
    if(t==null){
        Console.WriteLine("Paring to object failed");
    }
    else{
        Console.WriteLine($"Parsed to object with id:{t.Id} and name : {t.Name}");
        thelp.AddData(t);
    }
};
channel.BasicConsume(queue: "hello",
                     autoAck: true,
                     consumer: consumer);

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();


// foreach (var item in thelp.GetAllTodos())
// {
//     Console.WriteLine($"{item.Id} : {item.Name}");
// }