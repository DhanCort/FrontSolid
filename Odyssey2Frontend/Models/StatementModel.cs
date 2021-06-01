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
    public class StatementModel
    {
        public int intContactId { get; set; }
        public String strFullName { get; set; }
        public double numBalance { get; set; }
    }

    //==================================================================================================================
    public class GetStatementModel
    {
        public String strType { get; set; }
        public String strStartDate { get; set; }
        public String strEndDate { get; set; }
        public int intContactId { get; set; }
    }

    //==================================================================================================================
    public class StatementPdfModel
    {
        public String strLogoUrl { get; set; }
        public String strTitle { get; set; }
        public String strBilledTo { get; set; }
        public String strDate { get; set; }
        public String strDateFrom { get; set; }
        public String strDateTo { get; set; }
        public StatementRowPdfModel[] arrrow { get; set; }
        public double numCurrentDue { get; set; }
        public double num30DaysDue { get; set; }
        public double num60DaysDue { get; set; }
        public double num90DaysDue { get; set; }
        public double numMore90DaysDue { get; set; }
        public double numAmountDue { get; set; }
        public double? numnTotalCharge { get; set; }
        public double? numnTotalPayment { get; set; }
        public double? numnTotalAmount { get; set; }
    }

    //==================================================================================================================
    public class StatementRowPdfModel
    {
        public String strDate { get; set; }
        public String strType { get; set; }
        public String strNumber { get; set; }
        public double? numnCharge { get; set; }
        public double? numnPayment { get; set; }
        public double? numnAmount { get; set; }
        public double? numnBalance { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
