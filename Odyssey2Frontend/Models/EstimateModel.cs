/*TASK RP. ESTIMATION*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: july 6, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class EstimateModel
    {
        public int intEstimationId { get; set; }
        public int intPkWorkflow { get; set; }
        public String strNameWorkflow { get; set; }
        public bool boolHasOption { get; set; }
        public int intOrderId { get; set; }
        public int intJobId { get; set; }
        public String strJobNumber { get; set; }
        public String strJobTicket { get; set; }
        public int intProductKey { get; set; }
        public String strProductCategory { get; set; }
        public int? intnQuantity { get; set; }
        public String dateLastUpdate { get; set; }
        public String strDeliveryDate { get; set; }
        public String strDeliveryTime { get; set; }
        public String strBaseDate { get; set; }
        public String strBaseTime { get; set; }
        public String strDueDate { get; set; }
        public String strDueTime { get; set; }
        public List<EstimateOrderFormAttributesModel> arrattr { get; set; }
        public int intPkProduct { get; set; }
        public String strProductName { get; set; }
        public List<EstimateCalculationModel> arrcal { get; set; }
        public List<EstimateProcessModel> arrpro { get; set; }
        public double? numnJobEstimateCost { get; set; }
        public double? numnJobEstimatePrice { get; set; }
        public double numJobPrice { get; set; }
        public bool boolIsDownloadable { get; set; }
        public bool boolIsConfirmable { get; set; }
        public int? intnEstimationId { get; set; }
        public String strName { get; set; }
        public int? intnCopyNumber { get; set; }
        public int intQuantity { get; set; }
        public double numPrice { get; set; }
    }

    //==================================================================================================================
    public class EstimateOrderFormAttributesModel
    {
        public int intAttributeId { get; set; }
        public String strAttributeName { get; set; }
        public String strValue { get; set; }
    }

    //==================================================================================================================
    public class EstimateCalculationModel
    {
        public String strDescription { get; set; }
        public double numCost { get; set; }
    }

    //==================================================================================================================
    public class EstimateProcessModel
    {
        public int intPkProcess { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public String strName { get; set; }
        public List<EstimateCalculationModel> arrcal { get; set; }
        //Cambiar por arrres
        public List<EstimateResourcesModel> arrres { get; set; }
    }

    //==================================================================================================================
    public class EstimateResourcesModel
    {
        public int intPkProcessInWorkflow { get; set; }
        public int? intnPkResource { get; set; }
        public int? intnGroupResourceId { get; set; }
        public double numCostByResource { get; set; }
        public int? intnPk { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public String strName { get; set; }
        public double numQuantity { get; set; }
        public String strUnit { get; set; }
        public double numCost { get; set; }
        public bool boolHasOption { get; set; }
        //For GetOptions
        public double? numnQuantity { get; set; }
        public double? numnCost { get; set; }
        //For GetResourcesFromIoGroup
        public int intPk { get; set; }
        public bool boolIsAvailable { get; set; }
        public string[] arrstrInfo { get; set; }
        public bool boolIsCompleted { get; set; }
        public bool boolIsPaper { get; set; }
        public bool? boolnIsDeviceOrMiscConsumable { get; set; }
    }

    //==================================================================================================================
    public class EstimateOptionsModel
    {
        public int intJobId { get; set; }
        public int intPkWorkflow { get; set; }
        public String strBaseDate { get; set; }
        public String strBaseTime { get; set; }
        public int intId { get; set; }
        public List<EstimateResourcesModel> arrresSelected { get; set; }
        public List<OptionsModel> arrop { get; set; }
    }

    //==================================================================================================================
    public class OptionsModel
    {
        public double numJobCost { get; set; }
        public String strDeliveryDate { get; set; }
        public String strDeliveryTime { get; set; }
        public List<EstimateProcessModel> arrpro { get; set; }
    }

    //==================================================================================================================
    public class EstimationIntIdModel
    {
        public List<EstimateModel> arrest { get; set; }
        public bool boolIsDownloadable { get; set; }
        public bool boolIsFromJob { get; set; }
        public int intPkProduct { get; set; }
    }

    //==================================================================================================================
    public class EstimationId
    { 
        public int intId { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
    public class EstimationUpdateModel
    {
        public int intJobId { get; set; }
        public int intEstimationId { get; set; }
        public int intPkWorkflow { get; set; }
        public String strName { get; set; }
    }
    
    //==================================================================================================================
    public class SetEstimateQuantityModel
    {
        public int intJobId { get; set; }
        public int intPkWorkflow { get; set; }
        public int intQuantity { get; set; }
        public int intCopyNumber { get; set; }
    }

    //==================================================================================================================
    public class EstimatesSummaryModel
    {
        public String strEstimationName { get; set; }
        public int intQuantity { get; set; }
        public double numPrice { get; set; }
    }

    //==================================================================================================================
    public class SendEstimateModel
    {
        public int intJobId { get; set; }
        public int intPkWorkflow { get; set; }
        public double numPriceOne { get; set; }
        public double numPriceTwo { get; set; }
        public double numPriceThree { get; set; }
        public bool boolSendEmail { get; set; }
    }

    //==================================================================================================================
    public class ConvertToOrderModel
    {
        public int intJobId { get; set; }
        public int intPkWorkflow { get; set; }
        public int intEstimationId { get; set; }
        public int? intnCopyNumber { get; set; }
        public bool boolSendEmail { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
