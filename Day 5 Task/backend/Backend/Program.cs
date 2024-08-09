var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var todos = new List<Todo>();
todos.Add(new Todo(1,"First task", DateTime.Now));

app.MapGet("/", () => "Hello World!");

app.MapGet("/todos", ()=>{
    Console.WriteLine("Received get request for todos.");
    Console.WriteLine("Hi again");
    return TypedResults.Ok<List<Todo>>(todos);
});

app.MapPost("/add", (Todo todo)=>{
    Console.WriteLine();
});


app.Run();

public record Todo(int Id, string Name, DateTime DueDate);