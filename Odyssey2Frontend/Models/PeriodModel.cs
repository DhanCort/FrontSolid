/*TASK RP.PERIOD*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: May 2020, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PeriodModel
    {
        public int? intPk { get; set; }
        public int intPkPeriod { get; set; }
        public int? intnPkPeriod { get; set; }
        public string strPassword { get; set; }
        public int intPkResource { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public int intJobId { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public String strLastSunday { get; set; }
        public int? intnContactId { get; set; }
        public int intMinsBeforeDelete { get; set; }
        public String strJobNumber { get; set; }
    }

    //==================================================================================================================
    public class PeriodResponseModel
    {
        public int intPkPeriod { get; set; }
        public String strLastSunday { get; set; }
        public String strEstimatedDate { get; set; }
    }

    //==================================================================================================================
    public class DummyModel
    {
        public String strDateStart { get; set; }
        public String strTimeStart { get; set; }
        public String strDateEnd { get; set; }
        public String strTimeEnd { get; set; }
    }

    //==================================================================================================================
    public class WeekPeriodsModel
    {
        public String strDay { get; set; }
        public String strDate { get; set; }
        public List<PerPeriodModel> arrperortask { get; set; }
        public List<PerPeriodModel> arrperPeriods { get; set; }
    }

    //==================================================================================================================
    public class PerPeriodModel
    {
        public int? intnPkPeriod { get; set; }
        public int? intnPkTask { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public int? intJobId { get; set; }
        public String strJobId { get; set; }
        public bool boolIsAvailable { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public bool boolIsByResource { get; set; }
        public bool boolIsAbleToStart { get; set; }
        public bool boolIsAbleToEnd { get; set; }
        public String strProcess { get; set; }
        public String strJobName { get; set;  }
        public String strDescription { get; set; }
        public int intMinutesForNotification { get; set; }
        public bool boolIsNotifiedable { get; set; }
        public bool boolIsCompleted { get; set; }
        public String strCustomerName { get; set; }
        public String strCustomerLastName { get; set; }
        public int intMinsBeforeDelete { get; set; }
        public bool? boolnIsPeriodDone { get; set; }
        public String strJobNumber { get; set; }
        public bool boolPeriodStarted { get; set; }
    }

    //==================================================================================================================
    public class ResPerResourcePerdiodModel
    {
        public int intPkPeriod { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strDateSunday { get; set; }
    }
    
    //==================================================================================================================
    public class OverdueTaskModel
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public int intPkTask { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public String strDescription { get; set; }
        public bool boolIsCompleted { get; set; }
        public String strCustomerName { get; set; }
        public String strCustomerLastName { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
