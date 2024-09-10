using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace KafkaConnect.Models
{
    public class SheetWithIndex{
        public required SheetMessage Element {get; set;}
        public int Index {get; set;}
    }
    // [Table(name:"Sheet")]
    public partial class SheetMessage : SheetCSVData
    {
        public string Sheet_Id {get; set;} 
        public int Row_Id {get; set;}

        // [RegularExpression (@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$")]
        // public string Email_Id { get; set; }
        // public string? Name { get; set; }
        // public string? Country { get; set; }
        // public string? State { get; set; }
        // public string? City { get; set; }
        // public string? Telephone_no { get; set; }
        // public string? Address_Line_1 { get; set; }
        // public string? Address_Line_2 { get; set; }
        // public DateOnly? Date_of_Birth { get; set; }
        // public float FY_2019_20 { get; set; }
        // public float FY_2020_21 { get; set; }
        // public float FY_2021_22 { get; set; }
        // public float FY_2022_23 { get; set; }
        // public float FY_2023_24 { get; set; }
        public SheetMongoModel ToMongoModel(){
            return new SheetMongoModel {
                Email_Id = Email_Id,
                Name = Name,
                Sheet_Id = Sheet_Id,
                Address_Line_1 = Address_Line_1,
                Address_Line_2 = Address_Line_2,
                City = City,
                State = State,
                Country = Country,
                FY_2019_20 = FY_2019_20,
                FY_2020_21 = FY_2020_21,
                FY_2021_22 = FY_2021_22,
                FY_2022_23 = FY_2022_23,
                FY_2023_24 = FY_2023_24,
                Date_of_Birth = ToDateTimeConverter(Date_of_Birth),
                Row_Id = Row_Id,
                Telephone_no = Telephone_no
            };
        }
        public SheetMongoModel ToMongoModel(string id){
            var s = ToMongoModel();
            s.Id = id;
            return s;
        }
        private DateOnly? ToDateOnlyConverter(long? unixTimestampSeconds){
            if(unixTimestampSeconds==null){return null;}
            else{
                DateTimeOffset dateTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds((long)unixTimestampSeconds / 1000);
                DateTime dateTime = dateTimeOffset.DateTime; // Convert to DateTime
                return DateOnly.FromDateTime(dateTime); // Convert to DateOnly
            }
        }

        private DateTime? ToDateTimeConverter(long? microsecondCount){
            if(microsecondCount==null){return null;}
            DateTime unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            // Convert microseconds to ticks (1 tick = 0.1 microseconds, so 1 microsecond = 10 ticks)
            long ticks = (long)microsecondCount * 10;

            // Add ticks to the Unix epoch
            return unixEpoch.AddTicks(ticks);
        }
    }

    // [NotMapped]
    public partial class SheetCSVData{
        // [RegularExpression (@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$")]
        public string Email_Id { get; set; }
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }

        public string? Telephone_no { get; set; }
        public string? Address_Line_1 { get; set; }
        public string? Address_Line_2 { get; set; }
        public long? Date_of_Birth { get; set; }
        public float? FY_2019_20 { get; set; }
        public float? FY_2020_21 { get; set; }
        public float? FY_2021_22 { get; set; }
        public float? FY_2022_23 { get; set; }
        public float? FY_2023_24 { get; set; }
    }

    public class SheetMongoModel{
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }  
        public required string Sheet_Id {get; set;} 
        public int Row_Id {get; set;}
        public string Email_Id { get; set; }
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }

        public string? Telephone_no { get; set; }
        public string? Address_Line_1 { get; set; }
        public string? Address_Line_2 { get; set; }
        public DateTime? Date_of_Birth { get; set; }
        public float? FY_2019_20 { get; set; }
        public float? FY_2020_21 { get; set; }
        public float? FY_2021_22 { get; set; }
        public float? FY_2022_23 { get; set; }
        public float? FY_2023_24 { get; set; }
    }

    public class Report{
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public float AverageAge;
        public int MaxAge=int.MinValue;
        public int MinAge = int.MaxValue;
        public int TotalRecordCount;
        public int TotalAge;
    }
}