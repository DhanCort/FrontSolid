/*TASK RP. WORKFLOW BASE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: October 26, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class WorkflowBaseModel
    {
        public int intPkWorkflow { get; set; }
        public int? intnPkProduct { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/