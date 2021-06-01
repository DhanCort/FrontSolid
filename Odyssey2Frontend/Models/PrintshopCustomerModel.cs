/*TASK RP.CUSTOMER*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Aug 07, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PrintshopCustomerModel
    {
        public int intContactId { get; set; }
        public int? intnCompanyId { get; set; }
        public String strCompanyName { get; set; }
        public int? intnBranchId { get; set; }
        public String strBranchName { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public String  strEmail { get; set; }
        public String strRole { get; set; }
        public String strPhone { get; set; }
        public String strCellPhone { get; set; }
        public String strFullName { get; set; }
        public String strPassword { get; set; }
    }

    //==================================================================================================================
    public class CustomerPaymentModel
    {
        public int intContactId { get; set; }
        public String strFullName { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/