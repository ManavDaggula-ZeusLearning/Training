// using System;
// using System.Text;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Http;
// using RabbitMQ.Client;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Tasks.Model;
// using Sheets.Model;

// namespace Sheets.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     public class TodoItemsController : ControllerBase
//     {
//         private readonly SheetsContext _context;
//         private readonly IModel _channel;
//         private string[] permittedExtensions = { ".csv" };

//         public TodoItemsController(SheetsContext context)
//         {
//             _context = context;
//             var factory = new ConnectionFactory { HostName = "localhost" };
//             var connection = factory.CreateConnection();
//             _channel = connection.CreateModel();
//             _channel.QueueDeclare(queue: "hello",
//                      durable: false,
//                      exclusive: false,
//                      autoDelete: false,
//                      arguments: null);
//         }

//         // GET: api/TodoItems
//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<Todo>>> GetTodos()
//         {
//             return await _context.Todos.ToListAsync();
//         }

//         // GET: api/TodoItems/5
//         [HttpGet("{id}")]
//         public async Task<ActionResult<Todo>> GetTodo(string id)
//         {
//             var todo = await _context.Todos.FindAsync(id);

//             if (todo == null)
//             {
//                 return NotFound();
//             }

//             return todo;
//         }

//         // PUT: api/TodoItems/5
//         // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
//         [HttpPut("{id}")]
//         public async Task<IActionResult> PutTodo(string id, Todo todo)
//         {
//             if (id != todo.Id)
//             {
//                 return BadRequest();
//             }

//             _context.Entry(todo).State = EntityState.Modified;

//             try
//             {
//                 await _context.SaveChangesAsync();
//             }
//             catch (DbUpdateConcurrencyException)
//             {
//                 if (!TodoExists(id))
//                 {
//                     return NotFound();
//                 }
//                 else
//                 {
//                     throw;
//                 }
//             }

//             return NoContent();
//         }

//         // POST: api/TodoItems
//         // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
//         [HttpPost]
//         public async Task<ActionResult<Todo>> PostTodo(Todo todo)
//         {
//             _context.Todos.Add(todo);
//             await _context.SaveChangesAsync();

//             return CreatedAtAction("GetTodo", new { id = todo.Id }, todo);
//         }

//         // DELETE: api/TodoItems/5
//         [HttpDelete("{id}")]
//         public async Task<IActionResult> DeleteTodo(string id)
//         {
//             var todo = await _context.Todos.FindAsync(id);
//             if (todo == null)
//             {
//                 return NotFound();
//             }

//             _context.Todos.Remove(todo);
//             await _context.SaveChangesAsync();

//             return NoContent();
//         }

//         private bool TodoExists(string id)
//         {
//             return _context.Todos.Any(e => e.Id == id);
//         }
//     }
// }
