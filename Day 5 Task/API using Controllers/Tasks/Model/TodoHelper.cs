using System.Text.Json;
using Microsoft.EntityFrameworkCore;
// using BackendTrial.Server.Model;
namespace Tasks.Model{

    public class TodoHelper
    {
        TodoContext db;
        public TodoHelper(){
            db = new TodoContext();
        }

        public void AddData(Todo t){
            // db.Add(t);
            // db.SaveChanges();
            
            if(db.Todos.Find(t.Id)==null){
                // Console.WriteLine("within if");
                db.Add(t);
                db.SaveChanges();
                // Console.WriteLine("completed if");
            }
            else{
                Console.WriteLine("within else");
                Console.WriteLine($"Task id {t.Id} already exists");
            }
        }

        public List<Todo> GetAllTodos(){
            return db.Todos.ToList();
        }
    }
}