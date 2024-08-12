using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using BackendTrial.Server.Model;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                    durable: false,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);

string message = JsonSerializer.Serialize(new Todo{Id=4,Name="some other task"});
// string message = "hello";
var body = Encoding.UTF8.GetBytes(message);

channel.BasicPublish(exchange: string.Empty,
                    routingKey: "hello",
                    basicProperties: null,
                    body: body);
Console.WriteLine($" [x] Sent {message}");

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();
