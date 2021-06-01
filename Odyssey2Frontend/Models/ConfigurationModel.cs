using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Odyssey2Frontend.Models
{
    public class ConfigurationModel
    {
        public int intPk { get; set; }
        public String strCustomName { get; set; }
        public SelectList darrIntent { get; set; }
        public List<String> arrstrValues { get; set; }
        public int intPkProduct { get; set; }
    }

    public class IntentAttributeModel
    {
        public int intPk { get; set; }
        public String strName { get; set; }
        public bool boolIsAttribute { get; set; }
    }
}
