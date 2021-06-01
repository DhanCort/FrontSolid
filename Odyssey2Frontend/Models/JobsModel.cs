/*TASK RP. TASK ATTRIBUTE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 29, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JobsModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.

        public long intJobId { get; set; }
        public String strJobNumber { get; set; }
        public String strEstimateNumber { get; set; }
        public int intnOrderId { get; set; }
        public string strJobTicket { get; set; }
        public int intProductKey { get; set; }
        public String strProductName { get; set; }
        public String strProductCategory { get; set; }
        public int? intnQuantity { get; set; }
        public double unitPrice { get; set; }
        public string JDFAttributes { get; set; }
        public DateTime? dateLastUpdate { get; set; }
        public List<JobsAttributeModel> darrattrjson { get; set; }
        public double numMinCost { get; set; }
        public double numMinPrice { get; set; }
        public double numMaxCost { get; set; }
        public double numMaxPrice { get; set; }
        public int intPkWorkflow { get; set; }
        public int intPkProduct { get; set; }
        public double numProgress { get; set; }
        public String strStartDateTime { get; set; }
        public String strEndDateTime { get; set; }
        public String strDateLastUpdate { get; set; }
        public int? intnPkWorkflow { get; set; }
        public String strCustomerName { get; set; }
        public String strEstimateDate { get; set; }
    }

    //==================================================================================================================
    public class JobsAttributeModel
    {
        public int intAttributeId { get; set; }
        public String strAttributeName { get; set; }
        public String strValue { get; set; }
    }

    //==================================================================================================================
    public class JobWorkflowModel
    {
        public String strJobId { get; set; }
        public String strJobNumber { get; set; }
        public String strJobName { get; set; }
        public String strProductName { get; set; }
        public int intJobQuantity { get; set; }
        public int intPkProduct { get; set; }
        public double numCostByProduct { get; set; }
        public List<WorkflowModel> arrpro { get; set; }
        public double numJobPrice { get; set; }
        public double numJobCost { get; set; }
        public double numJobProfit { get; set; }
        public bool boolIsReady { get; set; }
        public String strStage { get; set; }
        public bool boolAllResourcesAreAvailable { get; set; }
        public String strDeliveryDate { get; set; }
        public String strDueDate { get; set; }
        public String strDueTime { get; set; }
        public bool boolIsDueDateReachable { get; set; }
        public bool boolInvoiced { get; set; }
        public double numJobFinalCost { get; set; }
        public double numJobFinalProfit { get; set; }
        public double? numnWisnetPrice { get; set; }
        public String strPriceMessage { get; set; }
    }

    //==================================================================================================================
    public class QuantitiesModel
    {
        public string strType { get; set; }
        public int intQuantity { get; set; }
    }

    //==================================================================================================================
    public class JobPriceModel
    {
        public int intJobId { get; set; }
        public double numPrice { get; set; }
        public String strDescription { get; set; }
        public int intPkWorkflow { get; set; }
        public int? intnEstimateId { get; set; }
        public int? intnCopyNumber { get; set; }
    }

    //==================================================================================================================
    public class JobDueDateModel
    {
        public int intJobId { get; set; }
        public String strDueDate { get; set; }
        public String strDueTime { get; set; }
        public String strDescription { get; set; }
    }

    //==================================================================================================================
    public class JobDueDateAndPriceLogModel
    {
        public String strDate { get; set; }
        public String strTime { get; set; }
        public double? numnPrice { get; set; }
        public String strDescription { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
    }

    //==================================================================================================================
    public class WorkflowProcessInputModel
    {
        public int? intnPkEleetOrEleele { get; set; }
        public int? intnPkResource { get; set; }
        public bool boolIsEleet { get; set; }
        public String strTypeTemplateAndResource { get; set; }
        public String strUnit { get; set; }
        public bool boolIsInput { get; set; }
        public bool boolIsComponent { get; set; }
        public bool boolIsComponet { get; set; }
        public bool boolIsMedia { get; set; }
        public bool boolSize { get; set; }
        public bool boolIsRoll { get; set; }
        public String strAreaUnit { get; set; }
    }

    //==================================================================================================================
    public class  JobMovementsModel
    {
        public List<JobAccountMovementsModel> arrAccountMovements { get; set; }
        public double numTotal { get; set; }
    }

    //==================================================================================================================
    public class JobAccountMovementsModel
    {
        public String strDate { get; set; }
        public String strAccountNumber { get; set; }
        public String strAccountName { get; set; }
        public String strNumber { get; set; }
        public double? numnIncrease { get; set; }
        public double? numnDecrease { get; set; }
        public String strTransacctionType { get; set; }
        public String strMemo { get; set; }
        public double numBalance { get; set; }
    }

    //==================================================================================================================
    public class JobPaymentModel
    {
        public String strName { get; set; }
        public int intJobId { get; set; }
    }

    //==================================================================================================================
    public class JobFilesModel
    {
        public String strFileName { get; set; }
        public String strFileUrl { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
