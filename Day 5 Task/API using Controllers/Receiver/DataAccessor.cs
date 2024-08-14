using System.Globalization;
using System.Data;
using System.Text;
using MySql.Data.MySqlClient;
using CsvHelper;
using Tasks.Model;

namespace Receiver{


    public class DataAccessor{

        private readonly MySqlConnection conn;
        public DataAccessor()
        {
            string connectionString = "server=localhost;user=root;database=todo;password=root";
            conn = new MySqlConnection(connectionString);
            conn.Open();
        }
        public void PrintTable(string tableName){
            string query = $"SELECT * FROM {tableName} LIMIT 10;";
            MySqlCommand cmd = new(query,conn);
            MySqlDataReader reader = cmd.ExecuteReader();
            while(reader.Read())
            {
                Console.Write("| ");
                // var t = reader.Cast<Todo>();
                // Console.Write(t.);

                for(int i=0; i<reader.FieldCount; i++){
                    
                    Console.Write(reader[i]+" | ");
                }
                Console.WriteLine();
            }
        }

        public void EnterSingleTodo(Todo t)
        {
            // var obj = new {Id="1",Name="V@gmail.com"};
            string query = $"insert into todo (Id , Name) values('{t.Id}','{t.Name}');";
            Console.WriteLine(query);
            MySqlCommand cmd = new MySqlCommand(query,conn);
            cmd.ExecuteNonQuery();
        }

        public void BulkInsert(List<Todo> todos)
        {
            var queryPart1 = "insert into todo (id,name) values ";
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
            cmd.ExecuteNonQuery();

        }
        // public void CreateConnection(){
        //     conn.Open();
        // }
        public static void Main(string[] args){
            Console.Clear();

            Console.WriteLine("Connecting to MySQL");
            DataAccessor c = new();
            // c.EnterSingleTodo(new Todo{Id="a",Name="asfasdf"});
            // c.PrintTable("Todo");
            // c.BulkInsert(new List<Todo> {new() { Id="a",Name="a"},new Todo{Id="b",Name="b"}});
            using (var reader = new StreamReader("myFile0.csv"))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                var countOfRecordsInAChunk = 1000;
            var currentCount = 0;
            var chunkCount = 0;
            var records = csv.GetRecords<Todo>();
            List<Todo> newTasks = new();

            foreach (var item in records)
            {
                newTasks.Add(item);
                // if(item.Id!=string.Empty && todoContext.Todos.Find(item.Id)==null){
                //     // todoContext.SaveChanges();
                // }
                currentCount++;
                if(currentCount==countOfRecordsInAChunk){
                    c.BulkInsert(newTasks);
                    newTasks.Clear();
                    Console.WriteLine($"saved chunk {chunkCount}");
                    // Thread.Sleep(3000);
                    currentCount=0;
                    chunkCount++;
                }
            }
            if(currentCount!=0){
                c.BulkInsert(newTasks);
                Console.WriteLine($"saved chunk {chunkCount}");
                // Thread.Sleep(3000);
                chunkCount++;
            }
            Console.WriteLine(chunkCount);
        
            }
            
        }
    }
}