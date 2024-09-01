using System.Globalization;
using System.Data;
using System.Text;
using MySql.Data.MySqlClient;
using CsvHelper;
using Tasks.Model;
using Sheets.Model;
using System;
using System.Text.RegularExpressions;
using System.Diagnostics;
using CsvHelper.Configuration;

namespace Receiver{


    public class DataAccessor{

        private readonly MySqlConnection conn;
        public DataAccessor()
        {
            string connectionString = "server=localhost;user=root;database=task5;password=root";
            conn = new MySqlConnection(connectionString);
            conn.Open();
            // Console.WriteLine("Connection open..");
        }
        // public void PrintTable(string tableName){
        //     string query = $"SELECT * FROM {tableName} LIMIT 10;";
        //     MySqlCommand cmd = new(query,conn);
        //     MySqlDataReader reader = cmd.ExecuteReader();
        //     while(reader.Read())
        //     {
        //         Console.Write("| ");
        //         // var t = reader.Cast<Todo>();
        //         // Console.Write(t.);

        //         for(int i=0; i<reader.FieldCount; i++){
                    
        //             Console.Write(reader[i]+" | ");
        //         }
        //         Console.WriteLine();
        //     }
        // }

        // public void EnterSingleTodo(Todo t)
        // {
        //     // var obj = new {Id="1",Name="V@gmail.com"};
        //     string query = $"insert into todos (Id , Name) values('{t.Id}','{t.Name}');";
        //     Console.WriteLine(query);
        //     MySqlCommand cmd = new MySqlCommand(query,conn);
        //     cmd.ExecuteNonQuery();
        // }

        public async Task BulkInsert(List<SheetCSVData> sheetsData, string sheetName, double percentageIncrementPerChunk, int rowStartIndex)
        {
            // string connectionString = "server=localhost;user=root;database=task5;password=root";
            // MySqlConnection conn = new MySqlConnection(connectionString);
            // conn.Open();
            // var sw = new Stopwatch();
            // sw.Start();
           /*  var queryPart1 = "insert into todos (id,name) values ";
            var queryPart3 = " as newValues on duplicate key update name=newValues.name";
            var queryPart2 = new StringBuilder();
            foreach (var item in todos)
            {
                queryPart2.Append($"('{item.Id}','{item.Name}'),");
            }
            // Console.WriteLine(queryPart2.Length);
            queryPart2.Remove(queryPart2.Length-1,1);
            string query = queryPart1+queryPart2+queryPart3;
            // Console.WriteLine(query);
            MySqlCommand cmd = new MySqlCommand(query,conn);
            cmd.ExecuteNonQuery(); */

            var queryPart1 = @"INSERT INTO Sheets (Sheet_ID, Row_Id,Email_ID, Name, Country, State, City, Telephone_no, Address_Line_1, Address_Line_2, Date_of_Birth, FY_2019_20, FY_2020_21, FY_2021_22, FY_2022_23, FY_2023_24) VALUES ";
            var queryPart3 = @" AS NEWVALUES ON DUPLICATE KEY UPDATE Name=NEWVALUES.Name, Country=NEWVALUES.Country, State=NEWVALUES.State, City=NEWVALUES.City, Telephone_no=NEWVALUES.Telephone_no, Address_Line_1=NEWVALUES.Address_Line_1, Address_Line_2=NEWVALUES.Address_Line_2, Date_of_Birth=NEWVALUES.Date_of_Birth, FY_2019_20=NEWVALUES.FY_2019_20, FY_2020_21=NEWVALUES.FY_2020_21, FY_2021_22=NEWVALUES.FY_2021_22, FY_2022_23=NEWVALUES.FY_2022_23, FY_2023_24=NEWVALUES.FY_2023_24;";
            var queryPart2 = new StringBuilder();
            // var query = $"INSERT INTO SHEETS (Sheet_ID, Email_ID, Name, Country, State, City, Telephone_no, Address_Line_1, Address_Line_2, Date_of_Birth, FY_2019_20, FY_2020_21, FY_2021_22, FY_2022_23, FY_2023_24) VALUES ('{sheetName}',@email,@name,@country,@state,@city,@telephone,@address1,@address2,@dob,@fy2019,@fy2020,@fy2021,@fy2022,@fy2023) AS NEWVALUES ON DUPLICATE KEY UPDATE Name=NEWVALUES.Name, Country=NEWVALUES.Country, State=NEWVALUES.State, City=NEWVALUES.City, Telephone_no=NEWVALUES.Telephone_no, Address_Line_1=NEWVALUES.Address_Line_1, Address_Line_2=NEWVALUES.Address_Line_2, Date_of_Birth=NEWVALUES.Date_of_Birth, FY_2019_20=NEWVALUES.FY_2019_20, FY_2020_21=NEWVALUES.FY_2020_21, FY_2021_22=NEWVALUES.FY_2021_22, FY_2022_23=NEWVALUES.FY_2022_23, FY_2023_24=NEWVALUES.FY_2023_24;";
            foreach (var item in sheetsData)
            {
                if(item.Email_Id!=string.Empty){
                // using (MySqlCommand cmd = new MySqlCommand(query,conn)){
                //     cmd.Parameters.AddWithValue("@email",item.Email_Id);
                //     cmd.Parameters.AddWithValue("@name",item.Name);
                //     cmd.Parameters.AddWithValue("@country",item.Country);
                //     cmd.Parameters.AddWithValue("@state",item.State);
                //     cmd.Parameters.AddWithValue("@city",item.City);
                //     cmd.Parameters.AddWithValue("@telephone",item.Telephone_no);
                //     cmd.Parameters.AddWithValue("@address1",item.Address_Line_1);
                //     cmd.Parameters.AddWithValue("@address2",item.Address_Line_2);
                //     cmd.Parameters.AddWithValue("@dob",item.Date_of_Birth?.ToString("yyyy-MM-dd"));
                //     cmd.Parameters.AddWithValue("@fy2019",item.FY_2019_20);
                //     cmd.Parameters.AddWithValue("@fy2020",item.FY_2020_21);
                //     cmd.Parameters.AddWithValue("@fy2021",item.FY_2021_22);
                //     cmd.Parameters.AddWithValue("@fy2022",item.FY_2022_23);
                //     cmd.Parameters.AddWithValue("@fy2023",item.FY_2023_24);
                //     // Console.WriteLine(cmd.CommandText);
                    
                //     cmd.ExecuteNonQuery();

                // }
                queryPart2.Append(@$"('{MySqlHelper.EscapeString(sheetName)}',{rowStartIndex++},'{MySqlHelper.EscapeString(item.Email_Id)}','{MySqlHelper.EscapeString(item.Name)}','{MySqlHelper.EscapeString(item.Country)}','{MySqlHelper.EscapeString(item.State)}','{MySqlHelper.EscapeString(item.City)}','{MySqlHelper.EscapeString(item.Telephone_no)}','{MySqlHelper.EscapeString(item.Address_Line_1)}','{MySqlHelper.EscapeString(item.Address_Line_2)}','{item.Date_of_Birth?.ToString("yyyy-MM-dd")}',{item.FY_2019_20},{item.FY_2020_21},{item.FY_2021_22},{item.FY_2022_23},{item.FY_2023_24})
                ,");
                }
            }
            if(queryPart2.Length!=0){
                // string connectionString = "server=localhost;user=root;database=task5;password=root";
                // var conn = new MySqlConnection(connectionString);
                // conn = new MySqlConnection(connectionString);
                // await conn.OpenAsync();
                queryPart2.Remove(queryPart2.Length-1,1);
                // var qp2 = MySqlHelper.EscapeString(queryPart2.ToString());
                string query = queryPart1+queryPart2+queryPart3;
                // Console.WriteLine(queryPart2);
                MySqlCommand cmd = new MySqlCommand(query,conn);
                await cmd.ExecuteNonQueryAsync();

                query = $"UPDATE FileStatuses SET COMPLETIONPERCENTAGE = COMPLETIONPERCENTAGE + {percentageIncrementPerChunk} WHERE FILEID='{MySqlHelper.EscapeString(sheetName)}';";
                cmd = new MySqlCommand(query,conn);
                await cmd.ExecuteNonQueryAsync();
                // Console.WriteLine("chunk added");
                // await conn.CloseAsync();
            }
            // sw.Stop();
            // Console.WriteLine(sw.Elapsed);
            // await conn.CloseAsync();
        }

        public async Task CloseAsync(){
            await conn.CloseAsync();
        }
        
        /* public static void Main(string[] args){
            // Console.Clear();

            // Console.WriteLine();
            Stopwatch sw = new();
            DataAccessor c = new();
            // c.EnterSingleTodo(new Todo{Id="a",Name="asfasdf"});
            // c.PrintTable("Todos");
            // c.BulkInsert(new List<Todo> {new() { Id="a",Name="a"},new Todo{Id="b",Name="b"}});
            // string filePath = "myFile0 (3).csv";
            // string filePath = "myFile0 (3) copy.csv";
            string filePath = "hopefully_good.csv";
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                PrepareHeaderForMatch = args => args.Header.ToLower(),
            };
            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, config))
            {
            var countOfRecordsInAChunk = 10000;
            var currentCount = 0;
            var chunkCount = 0;
            var records = csv.GetRecords<SheetModelWithoutSheetID>();
            List<SheetModelWithoutSheetID> newTasks = new();
            sw.Start();

            foreach (var item in records)
            {
                newTasks.Add(item);
                // Console.WriteLine(DateOnly.FromDateTime(DateTime.Today).ToString("dd-MM-yyyy"));
                // if(item.Id!=string.Empty && todoContext.Todos.Find(item.Id)==null){
                //     // todoContext.SaveChanges();
                // }
                currentCount++;
                if(currentCount==countOfRecordsInAChunk){
                    c.BulkInsert(newTasks, filePath);
                    newTasks.Clear();
                    Console.WriteLine($"saved chunk {chunkCount}");
                    // Thread.Sleep(3000);
                    currentCount=0;
                    chunkCount++;
                }
            }
            if(currentCount!=0){
                c.BulkInsert(newTasks, filePath);
                Console.WriteLine($"saved chunk {chunkCount}");
                // Thread.Sleep(3000);
                chunkCount++;
            }
            Console.WriteLine(chunkCount);
        
            }
            sw.Stop();
            Console.WriteLine(sw.Elapsed);
            
        } */
    }
}