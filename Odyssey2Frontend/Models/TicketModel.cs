/*TASK RP. ESTIMATION*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: September 11, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class TicketModel
    {
        public String strJobNumber { get; set; }
        //public int? intnOrderId { get; set; }
        public String strJobTicket { get; set; }
        public int intProductKey { get; set; }
        public String strProductName { get; set; }
        public String strProductCategory { get; set; }
        public String strJobStatus { get; set; }
        public String strDeliveryDate { get; set; }
        public String strDeliveryTime { get; set; }
        public String strDueDate { get; set; }
        public String strDueTime { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public int? intnQuantity { get; set; }
        public List<EstimateOrderFormAttributesModel> arrattr { get; set; }
        public String strCustomerName { get; set; }
        public String strCompany { get; set; }
        public String strBranch { get; set; }
        public String strAddressLine1 { get; set; }
        public String strAddressLine2 { get; set; }
        public String strCity { get; set; }
        public String strState { get; set; }
        public String strPostalCode { get; set; }
        public String strCountry { get; set; }
        public String strEmail { get; set; }
        public String strPhone { get; set; }
        public String strCustomerRep { get; set; }
        public String strSalesRep { get; set; }
        public String strDelivery { get; set; }
        public String strWorkflowName { get; set; }
        public List<EstimateCalculationModel> arrcal { get; set; }
        public List<TicketProcessModel> arrpro { get; set; }
        public double? numnJobCost { get; set; }
        public double? numnJobPrice { get; set; }
        public String strWisnetNote { get; set; }
        public String strOdyssey2Note { get; set; }
    }

    //==================================================================================================================
    public class TicketProcessModel
    {
        public String strName { get; set; }
        public List<EstimateCalculationModel> arrcal { get; set; }
        public List<TicketResourcesModel> arrres { get; set; }
    }

    //==================================================================================================================
    public class TicketResourcesModel
    {
        public String strName { get; set; }
        public double numQuantity { get; set; }
        public String strUnit { get; set; }
        public double numCost { get; set; }
        public String strEmployee { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
