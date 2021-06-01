/*TASK RP. TASK PROCCESS TEMPLATE*/
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December , 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class CalculationModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTANTS.

        public const String strBase = "B";
        public const String strPerUnit = "PU";
        public const String strBySpecCalculation = "BS";
        public const String strPerQuantity = "PQ";
        public const String strProfit = "P";
        public const String strBaseQuantity = "BQ";

        public const String strByProduct = "BPROD";
        public const String strByIntent = "BI";
        public const String strByProcess = "BPROC";
        public const String strByResource = "BRES";

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        public int intPk { get; set; }
        public int? intnJobId { get; set; }
        public int? intnGroupId { get; set; }
        public List<int> arrintPk { get; set; }
        public String strDescription { get; set; }
        public int? intnMinAmount { get; set; }
        public int? intnMaxAmount { get; set; }
        public double? numnCost { get; set; }
        public double numCostPerUnit { get; set; }
        public double? numnQuantity { get; set; }
        public double? numnProfit { get; set; }
        public String strOrderFormValue { get; set; }
        public String strValue { get; set; }
        public String condition { get; set; }
        public String strConditionToApply { get; set; }
        public String strConditionToApplyCoded { get; set; }
        public List<String> arrAscendantName { get; set; }
        public int? intnPkOrderFormAttribute { get; set; }
        public int? intnPkProcess { get; set; }
        public int? intnPkProduct { get; set; }
        public int intPkProduct { get; set; }
        public String strProcess { get; set; }
        public String strUnit { get; set; }
        public bool boolIsEnable { get; set; }
        public String strCustomName { get; set; }
        public SelectList darrIntent { get; set; }
        public SelectList darrattr { get; set; }
        public List<String> arrstrValues { get; set; }
        public String strAscendantElements { get; set; }
        public String strPrintshopId { get; set; }
        public String strCalculationType { get; set; }
        public List<int> arrintAscendantPk { get; set; }
        public bool? boolnIsByIntent { get; set; }
        public double? numnNeeded { get; set; }
        public double? numnPerUnits { get; set; }
        public String strBy { get; set; }
        public double? numnMin { get; set; }
        public bool? boolnIsWorkflow { get; set; }
        public int? intnPkProcessInWorkflow { get; set; }
        public String strProcessName { get; set; }
        public String strResourceName { get; set; }
        public String strQtyFromResourceName { get; set; }
        public double? numnQuantityWaste { get; set; }
        public double? numnPercentWaste { get; set; }
        public int? intnHours { get; set; }
        public int? intnMinutes { get; set; }
        public int? intnSeconds { get; set; }
        public int? intnPkEleetOrEleeleI { get; set; }
        public int? intnPkResourceI { get; set; }
        public bool? boolnIsEleetI { get; set; }
        public String strUnitI { get; set; }
        public String strTypeTemplateAndResourceO { get; set; }
        public int? intnPkEleetOrEleeleO { get; set; }
        public int? intnPkResourceO { get; set; }
        public bool? boolnIsEleetO { get; set; }
        public String strUnitO { get; set; }
        public String strAreaUnitO { get; set; }
        public bool? boolnByArea { get; set; }
        public double? numnBlock { get; set; }
        public int? intnPkTrans  { get; set; }
        public int? intnPkPaTrans { get; set; }
        public bool boolIsInPostProcess { get; set; }
        public bool boolIsEditable { get; set; }
        public int? intnPkAccount { get; set; }
        public String strAccountName { get; set; }
        public bool boolConditionAnd { get; set; }
        public bool? boolnFromThickness { get; set; }
        public bool boolFromThickness { get; set; }
        public bool? boolnIsBlock { get; set; }
        public bool boolIsBlock { get; set; }
        public bool boolHasCondition { get; set; }
    }

    //==================================================================================================================
    public class ConditionsModel
    {
        public String strCondition { get; set; }
        public int intId { get; set; }
    }

    //==================================================================================================================
    public class TranformationCalculationModel
    {
        public int? intnPk { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public double numNeeded { get; set; }
        public double numPerUnit { get; set; }
        public String strTypeTemplateAndResourceI { get; set; }
        public String strTypeTemplateAndResourceO { get; set; }
        public int intPkEleetOrEleeleI { get; set; }
        public bool boolIsEleetI { get; set; }
        public int intPkResourceI { get; set; }
        public String strUnitI { get; set; }
        public int intPkEleetOrEleeleO { get; set; }
        public bool boolIsEleetO { get; set; }
        public int intPkResourceO { get; set; }
        public String strUnitO { get; set; }
        public String condition { get; set; }
        public String strConditionToApply { get; set; }
        public String strConditionToApplyCoded { get; set; }
        public double? numnInferiorLimit { get; set; }
        public double? numnMinQty { get; set; }
        public double? numnSuperiorLimit { get; set; }
        public double? numnMaxQty { get; set; }
        public bool boolConditionAnd { get; set; }
        public bool boolHasCondition { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
