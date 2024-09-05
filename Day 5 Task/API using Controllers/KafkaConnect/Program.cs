using System.Reflection;
using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using KafkaConnect.Models;
using MongoDB.Bson;
using MongoDB.Driver;
var config = new ConsumerConfig
{
    // Fixed properties
    GroupId         = "kafka-connector",
    // User-specific properties that you must set
    BootstrapServers = "localhost:9092",
    AutoOffsetReset = AutoOffsetReset.Earliest
};

var mongoClient = new MongoClient("mongodb://localhost:27017");
var dbName = mongoClient.GetDatabase("task5");
var collection = dbName.GetCollection<Sheet>(
    "sheets");

// collection.InsertOne(new Sheet{Sheet_Id="abc", Row_Id=1, Email_Id="m@d.com"});

const string topic = "dbserver1.task5.sheets";

CancellationTokenSource cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) => {
    e.Cancel = true; // prevent the process from terminating.
    cts.Cancel();
};

using (var consumer = new ConsumerBuilder<Ignore, byte[]>(config)
            //.SetValueDeserializer(new ByteArrayDeserializer()) // Deserialize byte array to string
            .Build())
{
    consumer.Subscribe(topic);
    Console.WriteLine("Listening...");
    try {
        while (true) {
            var cr = consumer.Consume(cts.Token);
            // Deserialize message value from byte array to string
            if(cr.Message.Value!=null){
                
            var jsonString = Encoding.UTF8.GetString(cr.Message.Value);
            // Console.WriteLine(jsonString);
            // Convert JSON string to custom object
            var jelement = JsonSerializer.Deserialize<KafkaConnectModelValue>(jsonString);
            if(jelement.op!="d"){
                Console.WriteLine("new or changed row..");
                Console.WriteLine(jelement.after);
                var afterData = JsonSerializer.Deserialize<Sheet>(jelement.after);
                Console.WriteLine(afterData);
                if(jelement.op=="c"){
                    // insert
                    collection.InsertOne(afterData);
                }
                else if(jelement.op=="u"){
                    // update
                    var filter = Builders<Sheet>.Filter.Where(item => item.Email_Id==afterData.Email_Id && item.Sheet_Id==afterData.Sheet_Id);
                    collection.ReplaceOne(filter,afterData);
                }
                Console.WriteLine();
            }
            else{
                Console.WriteLine("deleting row...");
                // collection.DeleteOne(x=>x.Sheet_Id==)
                Console.WriteLine();
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

// Custom deserializer for byte array to string
public class ByteArrayDeserializer : IDeserializer<byte[]>
{
    // public byte[] Deserialize(ReadOnlyMemory<byte> data, bool isNull, SerializationContext context)
    // {
    //     return data.ToArray();
    // }

    public byte[] Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
    {
        return data.ToArray();
    }
}