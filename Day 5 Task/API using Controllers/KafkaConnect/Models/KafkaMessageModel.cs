using System.Text.Json;
using System.Text.Json.Nodes;

namespace KafkaConnect.Models{
    class KafkaConnectModelValue{
        public string op {get;set;}
        // public string before {get;set;}
        public JsonElement after {get; set;}
    }
}