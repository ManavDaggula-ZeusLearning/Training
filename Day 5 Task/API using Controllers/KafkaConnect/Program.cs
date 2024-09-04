﻿using Confluent.Kafka;
using System;
using System.Threading;

var config = new ConsumerConfig
{
    // Fixed properties
    GroupId         = "kafka-connector",
    // User-specific properties that you must set
    BootstrapServers = "localhost:9092",
    AutoOffsetReset = AutoOffsetReset.Earliest
};

const string topic = "dbserver1.task5.filestatuses";

CancellationTokenSource cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) => {
    e.Cancel = true; // prevent the process from terminating.
    cts.Cancel();
};

using (var consumer = new ConsumerBuilder<string, string>(config).Build())
{
    consumer.Subscribe(topic);
    try {
        while (true) {
            var cr = consumer.Consume(cts.Token);
            Console.WriteLine($"Consumed event from topic {topic}: key = {cr.Message.Key,-10} value = {cr.Message.Value}");
        }
    }
    catch (OperationCanceledException) {
        // Ctrl-C was pressed.
    }
    finally{
        consumer.Close();
    }
}