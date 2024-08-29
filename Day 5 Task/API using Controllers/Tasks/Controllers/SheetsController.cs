using System.Text;
using RabbitMQ.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sheets.Model;
using System.Text.RegularExpressions;
using System.Text.Json;

namespace Sheets.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SheetsController : ControllerBase
    {
        private readonly SheetsContext _context;
        private readonly IModel _channel;
        private string[] _permittedExtensions = { ".csv" };
        private int _pageSize = 100;

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
        public async Task<ActionResult<Dictionary<string, object>>> GetRowsInSheet(string sheetId, int page=0)
        {
            // int pageSize = 100;
            // return await _context.Sheets.Where(x=>x.Sheet_Id==sheetId).Skip(page*pageSize).Take(pageSize).ToListAsync();
            var result = new Dictionary<string, object>();
            result.Add("data", await _context.Sheets.Where(x=>x.Sheet_Id==sheetId).OrderBy(x=>x.Row_Id).Skip(page*_pageSize).Take(_pageSize).ToListAsync());
            result.Add("totalCount", await _context.Sheets.Where(x=>x.Sheet_Id==sheetId).CountAsync());
            return result;

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
            if (string.IsNullOrEmpty(ext) || !_permittedExtensions.Contains(ext)){
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
        public async Task<IActionResult> DeleteRow(string sheetId, [FromBody]List<string> emailId)
        {
            // var query = _context.Sheets.Where(x=> x.Sheet_Id==sheetId && emailId.Contains(x.Email_Id));
            // Console.WriteLine(query.ToQueryString());
            int firstRowId = (await _context.Sheets.Where(x=> x.Email_Id==emailId[0] && x.Sheet_Id==sheetId).ToListAsync())[0].Row_Id;
            await _context.Sheets.Where(x=> x.Sheet_Id==sheetId && emailId.Contains(x.Email_Id)).ExecuteDeleteAsync();
            // await _context.Database.ExecuteSqlRawAsync($"call update_row_ids({firstRowId},{emailId.Count});");
            // await _context.Sheets.Where(x=>x.Row_Id>=firstRowId).ExecuteUpdateAsync(setters=> setters.SetProperty(x=>x.Row_Id, x=>x.Row_Id-emailId.Count));
            // await _context.Sheets.Where(x=>x.Sheet_Id==sheetId && x.Email_Id==emailId).ExecuteDeleteAsync();
            return NoContent();
        }

        /* [HttpPatch("updateRow")]
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
                            string pattern = @"^\d{10}$";  // Pattern to match exactly 10 digits
                            if(newValues[key][item]!=null){
                                bool isMatch = Regex.IsMatch(newValues[key][item].ToString(), pattern);
                                if(isMatch){
                                    oldValue[0].Telephone_no = newValues[key][item]!=null ? newValues[key][item].ToString() : null;
                                }
                                else{
                                    return BadRequest("Telephone number invalid");
                                }
                            }
                            else{
                                    oldValue[0].Telephone_no = null;
                            }
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
                                string Email_pattern =  @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$";
                                bool EmailMatch = Regex.IsMatch(newValues[key][item].ToString(),Email_pattern);
                                if (newValues[key][item]!= null && EmailMatch){
                                    // oldValue[0].Email_Id = newValues[key][item].ToString();
                                    var oldRecord = oldValue[0];
                                    _context.Remove(oldRecord);
                                    await _context.SaveChangesAsync();
                                    oldRecord.Email_Id = newValues[key][item].ToString();
                                    _context.Add(oldRecord);
                                }
                                else{
                                    return BadRequest();
                                }
                                break;
                            
                            default:break;
                        }
                    }

                }
            }
            await _context.SaveChangesAsync();
            
            return NoContent();
        } */

        [HttpPatch("updateRow")]
        public async Task<IActionResult> UpdateRow(string sheetId, [FromBody]Dictionary<string,Dictionary<string,Object>> newValues)
        {
            var emailDict = await _context.Sheets.Where(x=> x.Sheet_Id==sheetId && newValues.Keys.Contains(x.Email_Id)).ToDictionaryAsync(x=>x.Email_Id);
            foreach (var key in emailDict.Keys)
            {
                var newEntity = newValues[key];
                foreach (var header in newEntity.Keys)
                    {
                        // Console.WriteLine(newEntity[item]);
                        switch (header.ToLower())
                        {
                            case "name":
                            emailDict[key].Name = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "city":
                            emailDict[key].City = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "state":
                            emailDict[key].State = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "country":
                            emailDict[key].Country = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "address_line_1":
                            emailDict[key].Address_Line_1 = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "address_line_2":
                            emailDict[key].Address_Line_2 = newEntity[header]!=null ? newEntity[header].ToString() : null;
                            break;
                            case "date_of_birth":
                            emailDict[key].Date_of_Birth = newEntity[header]!=null ? Convert.ToDateTime(newEntity[header].ToString()) : null;
                            break;
                            case "telephone_no":
                            string pattern = @"^\d{10}$";  // Pattern to match exactly 10 digits
                            if(newEntity[header]!=null){
                                bool isMatch = Regex.IsMatch(newEntity[header].ToString(), pattern);
                                if(isMatch){
                                    emailDict[key].Telephone_no = newEntity[header]!=null ? newEntity[header].ToString() : null;
                                }
                                else{
                                    return BadRequest("Telephone number invalid");
                                }
                            }
                            else{
                                    emailDict[key].Telephone_no = null;
                            }
                            break;
                            case "fy_2019_20":
                            emailDict[key].FY_2019_20 = newEntity[header]!=null ? Convert.ToSingle(newEntity[header].ToString()) : null;
                            break;
                            case "fy_2020_21":
                            emailDict[key].FY_2020_21 = newEntity[header]!=null ? Convert.ToSingle(newEntity[header].ToString()) : null;
                            break;
                            case "fy_2021_22":
                            emailDict[key].FY_2021_22 = newEntity[header]!=null ? Convert.ToSingle(newEntity[header].ToString()) : null;
                            break;
                            case "fy_2022_23":
                            emailDict[key].FY_2022_23 = newEntity[header]!=null ? Convert.ToSingle(newEntity[header].ToString()) : null;
                            break;
                            case "fy_2023_24":
                            emailDict[key].FY_2023_24 = newEntity[header]!=null ? Convert.ToSingle(newEntity[header].ToString()) : null;
                            break;
                            case "email_id":
                                string Email_pattern =  @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$";
                                bool EmailMatch = Regex.IsMatch(newEntity[header].ToString(),Email_pattern);
                                if (newEntity[header]!= null && EmailMatch){
                                    // emailDict[key].Email_Id = newEntity[header].ToString();
                                    var oldRecord = emailDict[key];
                                    _context.Remove(oldRecord);
                                    await _context.SaveChangesAsync();
                                    oldRecord.Email_Id = newEntity[header].ToString();
                                    _context.Add(oldRecord);
                                }
                                else{
                                    return BadRequest();
                                }
                                break;
                            
                            default:break;
                        }
                    }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }


        [HttpGet("find")]
        public async Task<ActionResult<List<Sheet>>> SearchInSheet(string sheetId, string searchText, [FromQuery]int page=0)
        {
            // int pageSize = 100;
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
            ).Skip(page*_pageSize).Take(_pageSize);
            return await query.ToListAsync();
        }

        [HttpGet("find/getIndices")]
        public async Task<ActionResult<List<SheetWithIndex>>>Search(string sheetId, string searchText , int page_no=0)
        {
            var data = await _context.Sheets.Where(x=>x.Sheet_Id==sheetId).OrderBy(x=>x.Row_Id).Skip(page_no*_pageSize).Take(_pageSize).ToListAsync();
            var results = data.Select((x,index)=>new SheetWithIndex{Index=page_no*_pageSize+index, Element=x}).OrderBy(x => x.Element.Row_Id).Where(x=>(x.Element.Name!=null && x.Element.Name.Contains(searchText)) ||
                (x.Element.City!=null && x.Element.City.Contains(searchText)) ||
                (x.Element.State!=null && x.Element.State.Contains(searchText)) ||
                ( x.Element.Country!=null && x.Element.Country.Contains(searchText)) ||
                ( x.Element.Telephone_no!=null && x.Element.Telephone_no.Contains(searchText)) ||
                ( x.Element.Address_Line_1!=null && x.Element.Address_Line_1.Contains(searchText)) ||
                ( x.Element.Address_Line_2!=null && x.Element.Address_Line_2.Contains(searchText)) ||
                ( x.Element.Date_of_Birth!=null && x.Element.Date_of_Birth.ToString().Contains(searchText)) ||
                ( x.Element.FY_2019_20!=null && x.Element.FY_2019_20.ToString().Contains(searchText)) ||
                ( x.Element.FY_2020_21!=null && x.Element.FY_2020_21.ToString().Contains(searchText)) ||
                ( x.Element.FY_2021_22!=null && x.Element.FY_2021_22.ToString().Contains(searchText)) ||
                ( x.Element.FY_2022_23!=null && x.Element.FY_2022_23.ToString().Contains(searchText)) ||
                ( x.Element.FY_2022_23!=null && x.Element.FY_2023_24.ToString().Contains(searchText))).ToList();
                // foreach (var item in results)
                // {
                //     Console.WriteLine("{0} : {1}", item.Row_Index, JsonSerializer.Serialize(item.Element));
                // }
 
                return results;
        }

    }
}
