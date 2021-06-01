using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Odyssey2Frontend.Models
{
    public class JDFResourceTemplateModel
    {
        [Required]
        public String strProcessId { get; set; }
        [Required]
        public String strResourceId { get; set; }
    }
}
