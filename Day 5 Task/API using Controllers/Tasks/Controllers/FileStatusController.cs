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
    public class FileStatusController : ControllerBase
    {
        private readonly SheetsContext _context;

        public FileStatusController(SheetsContext context)
        {
            _context = context;
        }

        [HttpGet("status/{fileId}")]
        public async Task<ActionResult<double>> GetFileStatus(string fileId)
        {
            FileStatus? f = await _context.FileStatuses.FindAsync(fileId);
            if(f==null)
            {
                return NotFound("File not found");
            }
            return f.CompletionPercentage;
        }

        [HttpGet("doesExist")]
        public async Task<ActionResult<bool>> DoesFileExist(string fileId)
        {
            FileStatus? f =  await _context.FileStatuses.FindAsync(fileId);
            if(f!=null && f.CompletionPercentage>=1){
                return true;
            }
            return false;
        }

        [HttpGet("getFileList")]
        public async Task<ActionResult<List<String>>> GetFileList()
        {
            return await _context.FileStatuses.Select(x=>x.FileId).ToListAsync();
        }
          
    }
}
