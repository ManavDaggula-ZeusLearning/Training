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
using System.Text.Json;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using MySql.Data.MySqlClient;

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
            int pageSize = 100;
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
                return Ok(filePath);
            }
            else{
                return BadRequest("Invalid file/corrupted file.");
            }

        }

        [HttpDelete]
        public async Task<IActionResult> DeleteRow(string sheetId, [FromQuery]List<string> emailId)
        {
            // var query = _context.Sheets.Where(x=> x.Sheet_Id==sheetId && emailId.Contains(x.Email_Id));
            // Console.WriteLine(query.ToQueryString());
            await _context.Sheets.Where(x=> x.Sheet_Id==sheetId && emailId.Contains(x.Email_Id)).ExecuteDeleteAsync();
            // await _context.Sheets.Where(x=>x.Sheet_Id==sheetId && x.Email_Id==emailId).ExecuteDeleteAsync();
            return NoContent();
        }

        [HttpPatch("updateRow")]
        public async Task<IActionResult> UpdateRow(string sheetId, [FromBody]Dictionary<string,Dictionary<string,Object>> newValues)
        {
            foreach (var key in newValues.Keys.ToList())
            {
                // Console.WriteLine(key);
                // var oldValues = await _context.Sheets.Where(x=>x.Email_Id==key && x.Sheet_Id==sheetId).ToListAsync();
                var oldValue = await _context.Sheets.Where(x=> x.Sheet_Id==sheetId && x.Email_Id==key).ToListAsync();
                if(oldValue.Count!=0){
                    foreach (var item in newValues[key].Keys.ToList())
                    {
                        // Console.WriteLine(newValues[key][item]);
                        switch (item.ToLower())
                        {
                            case "name":
                            oldValue[0].Name = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "city":
                            oldValue[0].City = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "state":
                            oldValue[0].State = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "country":
                            oldValue[0].Country = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "address_line_1":
                            oldValue[0].Address_Line_1 = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "address_line_2":
                            oldValue[0].Address_Line_2 = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "date_of_birth":
                            oldValue[0].Date_of_Birth = newValues[key][item]!=null ? Convert.ToDateTime(newValues[key][item].ToString()) : null;
                            break;
                            case "telephone_no":
                            oldValue[0].Telephone_no = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                            break;
                            case "fy_2019_20":
                            oldValue[0].FY_2019_20 = newValues[key][item]!=null ? Convert.ToSingle(newValues[key][item].ToString()) : null;
                            break;
                            case "fy_2020_21":
                            oldValue[0].FY_2020_21 = newValues[key][item]!=null ? Convert.ToSingle(newValues[key][item].ToString()) : null;
                            break;
                            case "fy_2021_22":
                            oldValue[0].FY_2021_22 = newValues[key][item]!=null ? Convert.ToSingle(newValues[key][item].ToString()) : null;
                            break;
                            case "fy_2022_23":
                            oldValue[0].FY_2022_23 = newValues[key][item]!=null ? Convert.ToSingle(newValues[key][item].ToString()) : null;
                            break;
                            case "fy_2023_24":
                            oldValue[0].FY_2023_24 = newValues[key][item]!=null ? Convert.ToSingle(newValues[key][item].ToString()) : null;
                            break;
                            case "email_id":
                                if(newValues[key][item]!=null){
                                    oldValue[0].Email_Id = newValues[key][item].ToString();
                                }
                                break;
                            
                            default:break;
                        }
                    }

                }
                /* if(oldValue!=null){
                    oldValue.Address_Line_1 = newValues[key].Address_Line_1;
                    oldValue.Address_Line_2 = newValues[key].Address_Line_2;
                    oldValue.City = newValues[key].City;
                    oldValue.Country = newValues[key].Country;
                    oldValue.State = newValues[key].State;
                    oldValue.Date_of_Birth = newValues[key].Date_of_Birth;
                    oldValue.FY_2019_20 = newValues[key].FY_2019_20;
                    oldValue.FY_2020_21 = newValues[key].FY_2020_21;
                    oldValue.FY_2021_22 = newValues[key].FY_2021_22;
                    oldValue.FY_2022_23 = newValues[key].FY_2022_23;
                    oldValue.FY_2023_24 = newValues[key].FY_2023_24;
                    oldValue.Telephone_no = newValues[key].Telephone_no;
                    oldValue.Name = newValues[key].Name;
                } */
            }
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        [HttpGet("find")]
        public async Task<ActionResult<List<Sheet>>> SearchInSheet(string sheetId, string searchText, [FromQuery]int page=0)
        {
            int pageSize = 100;
            // var query = "SELECT * FROM SHEETS WHERE SHEET_ID=@SHEET_ID AND MATCH(*) AGAINST(@SEARCHTEXT IN BOOLEAN MODE);";
            // return await _context.Sheets.FromSqlRaw(query, [new MySqlParameter("@SHEET_ID",sheetId),new MySqlParameter("@SEARCHTEXT", searchText)]).ToListAsync();
            // return await _context.Sheets.Where(x => x.Sheet_Id==sheetId).Skip(page*pageSize).Take(pageSize).ToListAsync();
            var query = _context.Sheets.Where(x => x.Sheet_Id==sheetId && 
            (x.Name.Contains(searchText) ||
            x.City.Contains(searchText) ||
            x.State.Contains(searchText) ||
            x.Country.Contains(searchText) ||
            x.Telephone_no.Contains(searchText) ||
            x.Address_Line_1.Contains(searchText) ||
            x.Address_Line_2.Contains(searchText) ||
            x.Date_of_Birth.ToString().Contains(searchText) ||
            x.FY_2019_20.ToString().Contains(searchText) ||
            x.FY_2020_21.ToString().Contains(searchText) ||
            x.FY_2021_22.ToString().Contains(searchText) ||
            x.FY_2022_23.ToString().Contains(searchText) ||
            x.FY_2023_24.ToString().Contains(searchText))
            ).Skip(page*pageSize).Take(pageSize);
            return await query.ToListAsync();
        }    
    }
}
