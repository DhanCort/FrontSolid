/*TASK RP.PRODUCT*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Sep 03, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class FilterModel
    {
        public int? intnOrderType { get; set; }
        public String strCategory { get; set; }
        public String strKeyword { get; set; }
        public int? intnCompanyId { get; set; }
        public int? intnBranchId { get; set; }
        public int? intnContactId { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class FilterResponseModel
    {
        public int intCompanyId { get; set; }
        public int intBranchId { get; set; }
        public int intContactId { get; set; }
        public String strName { get; set; }
        public String strContactInfo { get; set; }
        public String strCategory { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
