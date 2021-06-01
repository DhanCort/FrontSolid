/*TASK RP JOB PERIOD*/
using System;
using System.Collections.Generic;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: June 8, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JobCalendarModel
    {
        public JobLevelModel[] arrlevels { get; set; }
        public JobProcessInWorkflowModel[] arrpiw { get; set; }
    }
    
    //==================================================================================================================
    public class JobLevelModel
    {
        public List<JobLevelRulesModel> arrrule { get; set; }
        public List<JobLevelProcessModel> arrpro { get; set; }
        public List<JobPeriodModel> arrper { get; set; }
    }

    //==================================================================================================================
    public class JobProcessInWorkflowModel
    {
        public int intPk { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class JobProcessAndResourcesInWorkflowModel
    {
        public int intPkProcessInWorkflow { get; set; }
        public String strName { get; set; }
        public ProcessPeriodsModel[] arrproper { get; set; }
        public ProcessPeriodsModel[] arrresper { get; set; }
    }
    
    //==================================================================================================================
    public class ProcessPeriodsModel
    {
        public int intPkCalculation { get; set; }
        public int? intnPkPeriod { get; set; }
        public String strResource { get; set; }
        public String strDescription { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public int? intnContactId { get; set; }
        public String strStatus { get; set; }
    }

    //==================================================================================================================
    public class JobLevelProcessMainModel
    {
        public List<JobLevelModel> arrlevel { get; set; }
        public List<JobProcessModel> arrpro { get; set; }
    }

    //==================================================================================================================
    public class JobLevelRulesModel
    {
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
    }

    //==================================================================================================================
    public class JobLevelProcessModel
    {
        public String strName { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public List<JobPeriodModel> arrper { get; set; }
    }

    //==================================================================================================================
    public class JobPeriodModel
    {
        public String strName { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public bool boolIsRule { get; set; }
        public bool boolIsByProcess { get; set; }
        public bool boolIsTheFirstPeriod { get; set; }
        public bool boolIsTheLastPeriod { get; set; }
    }

    //==================================================================================================================
    public class JobProcessModel
    {
        public int intPkProcessInWorkflow { get; set; }
        public String strName { get; set; }
        public List<JobCalculationModel> arrcal { get; set; }
    }

    //==================================================================================================================
    public class PeriodsForJobAndWorkflowModel
    {
        public String strEstimateDate { get; set; }
        public List<JobProcessPeriodsModel> darrpro  { get; set; }
    }

    //==================================================================================================================
    public class JobProcessPeriodsModel
    {
        public int intPkProcessInWorkflow { get; set; }
        public String strName { get; set; }
        public List<JobCalculationModel> arrcal { get; set; }
        public List<JobResourcePeriodsModel> arrresper { get; set; }
    }
    //==================================================================================================================
    public class JobResourcePeriodsModel
    {
        public int intPkResource { get; set; }
        public int? intnPkEleetOrEleele { get; set; }
        public String strResource { get; set; }
        public bool boolIsEleet { get; set; }
        public List<JobResourcePeriodModel> arrresper { get; set; }
    }

    //==================================================================================================================
    public class JobResourcePeriodModel
    {
        public int? intnPkPeriod { get; set; }
        public int? intnEstimatedDuration { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public bool boolIsRule { get; set; }
        public int? intnContactId { get; set; }
        public int? intnMinsBeforeDelete { get; set; }
        public bool boolPeriodStarted { get; set; }
        public bool boolPeriodCompleted { get; set; }
    }

    //==================================================================================================================
    public class JobCalculationModel
    {
        public int intPkCalculation { get; set; }
        public String strDescription { get; set; }
        public int intHours { get; set; }
        public int intMinutes { get; set; }
        public int intSeconds { get; set; }
        public int? intnPkPeriod { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public String strEstimatedDate { get; set; }
        public int? intnContactId { get; set; }
        public bool boolProcessCompleted { get; set; }
        public int intMinsBeforeDelete { get; set; }
        public bool boolPeriodStarted { get; set; }
        public bool boolPeriodCompleted { get; set; }
    }
    
    //==================================================================================================================

    //public class JobPeriodModel
    //{
    //    public int intPkProcess { get; set; }
    //    public String strStartDay { get; set; }
    //    public String strEndDay { get; set; }
    //    public String strStartDate { get; set; }
    //    public String strEndDate { get; set; }
    //    public List<JobPeriodProcessModel> arrPeriods { get; set; }
    //    public List<JobPeriodProcessModel> arrResourcePeriods { get; set; }
    //}

    //public class JobPeriodProcessModel
    //{
    //    public int intnPkPeriod { get; set; }
    //    public String strStartDate { get; set; }
    //    public String strEndDate { get; set; }
    //    public String strStartTime { get; set; }
    //    public String strEndTime { get; set; }
    //    public String strJobId { get; set; }
    //}
}
/*END-TASK*/