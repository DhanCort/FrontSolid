using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Odyssey2Frontend.Models
{
    public class RuleModel
    {
        public int intPkRule { get; set; }
        public string strFrecuency { get; set; }
        public string strFrecuencyValue { get; set; }
        public string strStartTime { get; set; }
        public string strEndTime { get; set; }
        public int? intnPkResource { get; set; }
        public string strRangeStartDate { get; set; }
        public string strRangeStartTime { get; set; }
        public string strRangeEndDate { get; set; }
        public string strRangeEndTime { get; set; }
    }

    public class AddRuleModel
    {
        public int? intnPkResource { get; set; }
        public string strFrecuency { get; set; }
        public string strStartTime { get; set; }
        public string strEndTime { get; set; }
        public string strStartDate { get; set; }
        public string strEndDate { get; set; }
        public string strRangeStartDate { get; set; }
        public string strRangeStartTime { get; set; }
        public string strRangeEndDate { get; set; }
        public string strRangeEndTime { get; set; }
        public List<int> arrintDays { get; set; }
        public string strDay { get; set; }
        public bool boolIsEmployee { get; set; }
        public int? intnContactId { get; set; }
    }

    public class DeleteRuleModel
    {
        public int? intnPkResource { get; set; }
        public int intPkRule { get; set; }
    }
}
