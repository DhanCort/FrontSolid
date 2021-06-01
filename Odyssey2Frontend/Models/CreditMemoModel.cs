/*TASK R.P. CREDIT MEMO*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: December 11, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================

    public class OverpaidInvoicesModel
    {
        public int intPk { get; set; }
        public int intOrderNumber { get; set; }
        public double numOpenBalance { get; set; }
        public String strBilledTo { get; set; }
    }

    //==================================================================================================================
    public class NewCreditMemoModel
    {
        public int intContactId { get; set; }
        public int? intnPkInvoice { get; set; }
        public String strCustomerFullName { get; set; }
        public String strDate { get; set; }
        public String strBilledTo { get; set; }
        public String strDescription { get; set; }
        public int? intPkRevenueAccount { get; set; }
        public double numAmount { get; set; }
        public bool boolIsExempt { get; set; }
        public bool boolPrint { get; set; }
    }

    //==================================================================================================================
    public class CreditMemoModel
    {
        public int intPkCreditMemo { get; set; }
        public String strCreditMemoNumber { get; set; }
        public String strCustomerFullName { get; set; }
    }

    //==================================================================================================================
    public class CreditMemoForPDFModel
    {
        public String strCustomerFullName { get; set; }
        public String strCreditMemoNumber { get; set; }
        public String strDate { get; set; }
        public String strBilledTo { get; set; }
        public String strLogoUrl { get; set; }
        public String strDescription { get; set; }
        public double numAmount { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
