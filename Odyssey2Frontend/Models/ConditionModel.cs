/*TASK RP. TASK CONDITION TO APPLY*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: April 13, 2021.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class GroupConditionModel
    {
        public String strOperator { get; set; }
        public ConditionModel[] arrcond { get; set; }
        public GroupConditionModel[] arrgpcond { get; set; }
    }

    //==================================================================================================================
    public class ConditionModel
    {
        public int? intnPkAttribute { get; set; }
        public String strCondition { get; set; }
        public String strValue { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/