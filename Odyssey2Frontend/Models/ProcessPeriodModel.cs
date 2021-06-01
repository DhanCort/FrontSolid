/*TASK RP. PERIOD*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (EAPC - Adad Perez).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Jun 11, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class ProcessPeriodModel
    {
        public int? intnPkPeriod { get; set; }
        public string strPassword { get; set; }
        public string strStartDate { get; set; }
        public string strStartTime { get; set; }
        public string strEndDate { get; set; }
        public string strEndTime { get; set; }
        public int intJobId { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public int intPkCalculation { get; set; }
        public int? intnContactId { get; set; }
        public int intMinsBeforeDelete { get; set; }

    }

    //==================================================================================================================
}
/*END-TASK*/
