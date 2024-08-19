using Microsoft.EntityFrameworkCore;

namespace Sheets.Model{

    [PrimaryKey(nameof(FileId))]
    public class FileStatus{
        public string FileId {get; set;}
        public double CompletionPercentage {get; set;} = 0;
    }
}