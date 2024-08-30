using Microsoft.EntityFrameworkCore;

namespace Sheets.Model{

    [PrimaryKey(nameof(FileId))]
    public class FileStatus{
        public required string FileId {get; set;}
        public double CompletionPercentage {get; set;} = 0;
    }
}