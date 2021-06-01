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
    public class BankDepositModel
    {
        public int intPkPayment { get; set; }
        public String strCustomerFullName { get; set; }
        public String strDate { get; set; }
        public String strMethodName { get; set; }
        public String strReference { get; set; }
        public double numAmount { get; set; }
    }

    //==================================================================================================================
    public class BankAccountsModel
    {
        public int intPk { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class BankDepositsInARangeModel
    {
        public int intPkBankDeposit { get; set; }
        public String strDate { get; set; }
        public double numAmount { get; set; }
    }

    //==================================================================================================================
    public class BankDepositSummaryModel
    {
        public String strBankAccountName { get; set; }
        public String strDepositDate { get; set; }
        public String strDate { get; set; }
        public DepositPaymentModel[] arrPayments { get; set; }
        public double numTotal { get; set; }
    }

    //==================================================================================================================
    public class DepositPaymentModel
    {
        public String strCustomerFullName { get; set; }
        public String strMethodName { get; set; }
        public String strReference { get; set; }
        public double numAmount { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
