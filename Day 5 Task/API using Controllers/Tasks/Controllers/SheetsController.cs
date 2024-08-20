using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using RabbitMQ.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sheets.Model;

namespace Sheets.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SheetsController : ControllerBase
    {
        private readonly SheetsContext _context;
        private readonly IModel _channel;
        private string[] permittedExtensions = { ".csv" };

        public SheetsController(SheetsContext context)
        {
            _context = context;
            var factory = new ConnectionFactory { HostName = "localhost" };
            var connection = factory.CreateConnection();
            _channel = connection.CreateModel();
            _channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);
        }
        
        [HttpGet("{sheetId}")]
        public async Task<ActionResult<IEnumerable<Sheet>>> GetRowsInSheet(string sheetId, int page=0)
        {
            int pageSize = 5;
            return await _context.Sheets.Where(x=>x.Sheet_Id==sheetId).Skip(page*pageSize).Take(pageSize).ToListAsync();
        }

        [HttpGet("getRow")]
        public async Task<ActionResult<Sheet>> GetRow(string emailId, string sheetId){
            var q = await _context.Sheets.Where(x=>x.Email_Id==emailId && x.Sheet_Id==sheetId).ToListAsync();
            if(q.Count!=0){
                return q[0];
            }
            else{
                return BadRequest("No row found with given values");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Sheet>> PostSheet(Sheet sheet)
        {
            _context.Sheets.Add(sheet);
            await _context.SaveChangesAsync();

            return CreatedAtAction("PostSheet", new { id = sheet.Email_Id }, sheet);
        }

        // POST : /api/Sheets/uploadFile
        [HttpPost("uploadFile")]
        public async Task<IActionResult> FromFile(IFormFile file)
        {
            // Console.WriteLine(file.ContentType);
            // Console.WriteLine(file.FileName);
            string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(ext) || !permittedExtensions.Contains(ext)){
                return BadRequest("Invalid file type for a csv file.");
            }

            string filePath;
            if (file.Length > 0)
            {
                filePath = Path.GetRandomFileName()+".csv";
                Console.WriteLine(filePath);
                using (var stream = System.IO.File.Create(Path.Combine("../tempFiles", filePath)))
                {
                    await file.CopyToAsync(stream);
                }
                _context.FileStatuses.Add(new Sheets.Model.FileStatus{FileId=filePath});
                await _context.SaveChangesAsync();
                var body = Encoding.UTF8.GetBytes($"{filePath}");
                _channel.BasicPublish(exchange: string.Empty,
                        routingKey: "hello",
                        basicProperties: null,
                        body: body);
                Console.WriteLine($" [x] Sent {filePath}");
                return Ok(file.FileName);
            }
            else{
                return BadRequest("Invalid file/corrupted file.");
            }

        }

        [HttpDelete]
        public async Task<IActionResult> DeleteRow(string sheetId, string emailId)
        {
            await _context.Sheets.Where(x=>x.Sheet_Id==sheetId && x.Email_Id==emailId).ExecuteDeleteAsync();
            return NoContent();
        }

        [HttpPatch("updateRow")]
        public async Task<IActionResult> UpdateRow(string sheetId, string emailId, [FromBody]Sheet newValues){
            var oldValues = await _context.Sheets.Where(x=>x.Email_Id==emailId && x.Sheet_Id==sheetId).ToListAsync();
            if(oldValues.Count!=0){
                oldValues[0].Address_Line_1 = newValues.Address_Line_1;
                oldValues[0].Address_Line_2 = newValues.Address_Line_2;
                oldValues[0].City = newValues.City;
                oldValues[0].Country = newValues.Country;
                oldValues[0].State = newValues.State;
                oldValues[0].Date_of_Birth = newValues.Date_of_Birth;
                oldValues[0].FY_2019_20 = newValues.FY_2019_20;
                oldValues[0].FY_2020_21 = newValues.FY_2020_21;
                oldValues[0].FY_2021_22 = newValues.FY_2021_22;
                oldValues[0].FY_2022_23 = newValues.FY_2022_23;
                oldValues[0].FY_2023_24 = newValues.FY_2023_24;
                oldValues[0].Name = newValues.Name;
                oldValues[0].Telephone_no = newValues.Telephone_no;
                await _context.SaveChangesAsync();
            }
            
            return NoContent();
        }


    }
}
