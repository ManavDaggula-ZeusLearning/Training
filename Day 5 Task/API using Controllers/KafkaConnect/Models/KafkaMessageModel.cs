using System.Text.Json;
using System.Text.Json.Nodes;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace KafkaConnect.Models{
    class KafkaConnectModelValue{
        public string op {get;set;}
        // public string before {get;set;}
        public JsonElement before {get; set;}
        public JsonElement after {get; set;}
    }
    class KafkaConnectModelKey{
        public string Email_Id {get;set;}
        // public string before {get;set;}
        public string Sheet_Id {get; set;}
        public int Row_Id {get; set;}
    }
}