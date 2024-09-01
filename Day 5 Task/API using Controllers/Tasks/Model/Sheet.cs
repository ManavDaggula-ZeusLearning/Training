using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Sheets.Model{

    public class SheetWithIndex{
        public required Sheet Element {get; set;}
        public int Index {get; set;}
    }


    [PrimaryKey(nameof(Sheet_Id),nameof(Row_Id),nameof(Email_Id))]
    // [Table(name:"Sheet")]
    public partial class Sheet : SheetCSVData
    {
        public required string Sheet_Id {get; set;} 
        public int Row_Id {get; set;}

        // [RegularExpression (@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$")]
        // public string Email_Id { get; set; }
        // public string? Name { get; set; }
        // public string? Country { get; set; }
        // public string? State { get; set; }
        // public string? City { get; set; }
        // public string? Telephone_no { get; set; }
        // public string? Address_Line_1 { get; set; }
        // public string? Address_Line_2 { get; set; }
        // public DateOnly? Date_of_Birth { get; set; }
        // public float FY_2019_20 { get; set; }
        // public float FY_2020_21 { get; set; }
        // public float FY_2021_22 { get; set; }
        // public float FY_2022_23 { get; set; }
        // public float FY_2023_24 { get; set; }
    }

    // [NotMapped]
    public partial class SheetCSVData{
        // [RegularExpression (@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$")]
        [Required]
        [EmailAddress]
        public string Email_Id { get; set; }
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }

        [RegularExpression(@"^\d{10}$", ErrorMessage = "Telephone number must be exactly 10 digits.")]
        public string? Telephone_no { get; set; }
        public string? Address_Line_1 { get; set; }
        public string? Address_Line_2 { get; set; }
        public DateTime? Date_of_Birth { get; set; }
        public float? FY_2019_20 { get; set; }
        public float? FY_2020_21 { get; set; }
        public float? FY_2021_22 { get; set; }
        public float? FY_2022_23 { get; set; }
        public float? FY_2023_24 { get; set; }
    }

}

