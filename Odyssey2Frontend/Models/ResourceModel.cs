/*TASK RP.RESOURCE*/
using System;
using System.Collections.Generic;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: December 19, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class ResourceModel
    {
        public int intPk { get; set; }

        public String strTypeId { get; set; }

        public bool boolHasIt { get; set; }

        public String strUsage { get; set; }

        public String strClassification { get; set; }

        public bool boolIsType { get; set; }

        public String strUnit { get; set; }

        public bool boolIsPhysical { get; set; }

        public double? numQuantity { get; set; }

        public double? numCost { get; set; }

        public double? numnMin { get; set; }

        public bool? boolIsBlock { get; set; }

        public List<ResourcesByProcessModel> arrres { get; set; }
    }

    //==================================================================================================================
    public class ResourceToProcessModel
    {
        public String strPrintshopId { get; set; }

        public int intPkProcess { get; set; }

        public int? intnPkType { get; set; }

        public int? intnPkTemplate { get; set; }

        public String strInputOrOutput { get; set; }
    }

    //==================================================================================================================
    public class ResourcesByProcessModel
    {
        public int intPk { get; set; }

        public String strTypeId { get; set; }

        public String strResourceName { get; set; }

        public bool boolHasIt { get; set; }

        public String strClassification { get; set; }

        public bool? boolnUsage { get; set; }
        public bool boolIsPhysical { get; set; }
    }

    //==================================================================================================================
    public class MyResourcesModel
    {
        public String strPrintshopId { get; set; }
        public int intPkType { get; set; }
        public String strResourceName { get; set; }
        public int? intnPkInherited { get; set; }
        public bool boolIsTemplate { get; set; }
        public bool boolIsType { get; set; }
        public bool boolIsResource { get; set; }
        public int intPkResource { get; set; }
        public List<ResourceAscendantValues> arrattr { get; set; }
        public String strTypeId { get; set; }
        public int intValuePk { get; set; }
        public String strValue { get; set; }
        public List<ResourceAscendantValues> arrasc { get; set; }
        public List<String> arrstrAscendant { get; set; }
        public List<int> arrAscendantPk { get; set; }
        public List<String> arrstrValue { get; set; }
        public int intPk { get; set; }
        public String strName { get; set; }
        public String strUnit { get; set; }
        public bool? boolnIsAvailable { get; set; }
        public bool? boolnIsCalendar { get; set; }
        public bool? boolnCalendarIsChangeable { get; set; }
        public bool? boolnCostIsChangeable { get; set; }
        public InheritanceToAddModel inhe { get; set; }
        public bool? boolnIsDecimal { get; set; }
    }

    //==================================================================================================================
    public class ResourceIsAddableModel
    {
        public int intPkType { get; set; }
        public List<ResourceAscendantValues> arrattr { get; set; }
    }

    //==================================================================================================================
    public class ResourceAscendantValues
    {
        public String strAscendant { get; set; }
        public String strValue { get; set; }
        public int? intnPkInheritedValue { get; set; }
        public int? intnInheritedValuePk { get; set; }
        public bool boolChangeable { get; set; }
        public int? intnPkValueToDeleteToAddANewOne { get; set; }
        public List<String> arrAscendant { get; set; }
        public List<String> arrstrAscendant { get; set; }

    }

    //==================================================================================================================
    public class CustomResource
    {
        public String strPrintshopId { get; set; }

        public String strResourceName { get; set; }

        public List<String> arrstrAttribute { get; set; }

        public List<String> arrstrValue { get; set; }

        public String strUnit { get; set; }
        public bool boolnIsDecimal { get; set; }
    }

    //==================================================================================================================
    public class CostModel
    {
        public int intPkResource { get; set; }
        public String strUnit { get; set; }
        public double? numnQuantity { get; set; }
        public double? numnCost { get; set; }
        public double? numnMin { get; set; }
        public double? numnBlock { get; set; }
        public int? intnPkAccount { get; set; }
        public double? numnHourlyRate { get; set; }
        public bool? boolnArea { get; set; }
        public String strDimensionUnit { get; set; }
        public bool boolPaper { get; set; }
    }

    //==================================================================================================================
    public class JsonCostResponseModel
    {
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public Object objResponse { get; set; }
    }

    //==================================================================================================================
    public class ResourceTimeOutModel
    {
        public int? intPkResource { get; set; }
        public double numQuantity { get; set; }
        public int intHours { get; set; }
        public int intMinutes { get; set; }
        public int intSeconds { get; set; }
        public double? numnMinThickness { get; set; }
        public double? numnMaxThickness { get; set; }
        public String strThicknessUnit { get; set; }
        public int? intPkTime { get; set; }
    }

    //==================================================================================================================
    public class ResourceTimeModel
    {
        public int intPkTime { get; set; }
        public String strUnit { get; set; }
        public double numQuantity { get; set; }
        public int intHours { get; set; }
        public int intMinutes { get; set; }
        public int intSeconds { get; set; }
        public double? numnMinThickness { get; set; }
        public double? numnMaxThickness { get; set; }
        public String strThicknessUnit { get; set; }
    }

    //==================================================================================================================
    public class InheritanceModel
    {
        public int? intnPkTemplate { get; set; }
        public bool boolIsDeviceToolOrCustom { get; set; }
        public InheritanceDataModel unitinhe { get; set; }
        public InheritanceDataModel costinhe { get; set; }
        public InheritanceDataModel avainhe { get; set; }
        public InheritanceDataModel attrjson3 { get; set; }
        public InheritanceDataModel attr { get; set; }
    }

    //==================================================================================================================
    public class InheritanceDataModel
    {
        public String strValue { get; set; }
        public double? numnCost { get; set; }
        public double? numnQuantity { get; set; }
        public double? numnMin { get; set; }
        public double? numnBlock { get; set; }
        public bool? boolnIsCalendar { get; set; }
        public bool? boolnIsAvailable { get; set; }
        public bool? boolnIsChangeable { get; set; }
        public bool? boolnIsInherited { get; set; }
        public bool? boolnIsDecimal { get; set; }
        public int? intnPkAccount { get; set; }
        public double? numnHourlyRate { get; set; }
        public bool? boolnArea { get; set; }
    }

    //==================================================================================================================
    public class InheritanceToAddModel
    {
        public InheritanceDataModel unit { get; set; }
        public InheritanceDataModel cost { get; set; }
        public InheritanceDataModel avai { get; set; }
    }

    //==================================================================================================================
}
