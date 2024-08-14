using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Sheets.Model{
    public partial class Sheet
    {
        [Key]
        public string Id { get; set; }

        public string? Name { get; set; }
    }

}

