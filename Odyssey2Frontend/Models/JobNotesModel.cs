/*TASK RP.STATEMENT*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Dec 8, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JobNotesModel
    {
        public int intPkNote { get; set; }
        public int? intnPkNote { get; set; }
        public String strWisnetNote { get; set; }
        public String strOdyssey2Note { get; set; }
        public String strPeriodsNote { get; set; }
        public String strNote { get; set; }
    }

    //==================================================================================================================
    public class ProcessNotesModel
    {
        public String strProcessName { get; set; }
        public int? intnPreviousJobId { get; set; }
        public int? intnPkWorkflow { get; set; }
        public String strJobName { get; set; }
        public List<ProcessNotesNotesModel> arrnotes { get; set; }

    }

    //==================================================================================================================
    public class ProcessNotesNotesModel
    {
        public int intPkNote { get; set; }
        public String strNote { get; set; }
    }

    //==================================================================================================================
    public class JobProcessNotesModel
    {
        public int intPkNote { get; set; }
        public int? intnPkNote { get; set; }
        public String strWisnetNote { get; set; }
        public String strOdyssey2Note { get; set; }
        public int? intnPreviousJobId { get; set; }
        public int? intnPkWorkflow { get; set; }
        public String strJobName { get; set; }
        public List<ProcessNotesModel> arrpronotes { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
