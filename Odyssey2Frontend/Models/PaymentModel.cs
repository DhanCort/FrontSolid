/*TASK R.P Payment*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: December 10, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PaymentMethodsAndBankAccounts
    {
        public int intPk { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class OpenInvoicesModel
    {
        public OpenInvoiceModel[] arrOpenInvoices { get; set; }
        public int intContactId { get; set; }
    }

    //==================================================================================================================
    public class OpenInvoiceModel
    {
        public int intPkInvoice { get; set; }
        public int intInvoiceNumber { get; set; }
        public double numOriginalAmount { get; set; }
        public double numOpenBalance { get; set; }
    }

    //==================================================================================================================
    public class OpenCreditsModel
    {
        public int intPkCredit { get; set; }
        public String strCreditNumber { get; set; }
        public double numOriginalAmount { get; set; }
        public double numOpenBalance { get; set; }
        public bool boolIsCreditMemo { get; set; }
    }

    //==================================================================================================================
    public class PaymentModel
    {
        public int intContactId { get; set; }
        public String strDate { get; set; }
        public int? intnPkPaymentMethod { get; set; }
        public String strReference { get; set; }
        public int? intnPkAccount { get; set; }
        public int[] arrintPkInvoices { get; set; }
        public OpenCreditsModel[] arrCredits { get; set; }
        public double numAmountReceived { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/