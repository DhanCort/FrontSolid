/*TASK RP.ACCOUNTING*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: November 2, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class AccountModel
    {
        public int intPk { get; set; }
        public String strNumber { get; set; }
        public String strName { get; set; }
        public bool boolEnabled { get; set; }
        public bool boolIsGeneric { get; set; }
        public int intPkType { get; set; }
        public string strTypeName { get; set; }
        public double numAmount { get; set; }
        public String strAccountType { get; set; }
    }

    //==================================================================================================================
    public class AccountTypeModel
    {
        public int intPkType { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class AccountMovementsModel
    {
        public List<AccountMovementsDetailsModel> arrAccount { get; set; }
        public double numTotalExpenses { get; set; }
    }

    //==================================================================================================================
    public class AccountMovementsDetailsModel
    {
        public int intPk { get; set; }
        public String strNumber { get; set; }
        public String strName { get; set; }
        public double numAmount { get; set; }
        public String strAccountType { get; set; }
    }

    //==================================================================================================================
    public class AllAccountDetailsModel
    {
        public bool boolIsAsset { get; set; }
        public List<AccountDetailsModel> arrAccountMovements { get; set; }
    }

    //==================================================================================================================
    public class AccountDetailsModel
    {
        public String strDate { get; set; }
        public String strTransacctionType { get; set; }
        public String strNumber { get; set; }
        public String strName { get; set; }
        public String strMemo { get; set; }
        public double? numnChargeOrIncrease { get; set; }
        public double? numnPaymentOrDecrease { get; set; }
        public double numBalance { get; set; }
    }

    //==================================================================================================================
    public class AccountDetailsByPeriod
    {
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public int intPkAccount { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
