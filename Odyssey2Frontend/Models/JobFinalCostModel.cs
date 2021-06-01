/*TASK RP.FINAL*/
using System;
using System.Collections.Generic;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: June 22, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JobFinalCost
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public double numEstimateCost { get; set; }
        public double numFinalCost { get; set; }
        public double numCostDifference { get; set; }
        public double numEstimatedProfit { get; set; }
        public double numFinalProfit { get; set; }
        public double numCostByProduct { get; set; }
        public JobProcessFinalCostModel[] arrpro { get; set; }
    }

    //==================================================================================================================
    public class JobProcessFinalCostModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //   

        public int intPkprocessInWorkflow { get; set; }
        public String strProcessName { get; set; }
        public double numEstimateCost { get; set; }
        public double? numFinalCost { get; set; }
        public double numCostDifference { get; set; }
        public List<JobResourceCalculationFinalCostModel> arrresourcecost { get; set; }
        public List<JobResourceCalculationFinalCostModel> arrcalculationscost { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    public class JobResourceCalculationFinalCostModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public String strResourceName { get; set; }
        public String strCalculationName { get; set; }
        public double numEstimateCost { get; set; }
        public double? numFinalCost { get; set; }
        public double numCostDifference { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class UpdateCostOrQuantityModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public int? intnPkCalculation { get; set; }
        public int? intnPkResource { get; set; }
        public int? intnPkEleetOrEleele { get; set; }
        public bool? boolnIsEleet { get; set; }
        public int intJobId { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public double? numnFinalQuantity { get; set; }
        public double? numnFinalCost { get; set; }
        public String strDescription { get; set; }
        public int intPkAccountMovement { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class FinalCostLogModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public String strDateTime { get; set; }
        public double? numnFinalQuantity { get; set; }
        public double? numnCostWithFinalQuantity { get; set; }
        public double? numnFinalCost { get; set; }
        public String strDescription { get; set; }
        public String strFirstName { get; set; }
        public String strLastName { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class FinalCostDataModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public int intPkJob { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public String strSubStage { get; set; }
        public bool boolJobCompleted { get; set; }
        public List<ProcessBaseCost> arrcalBase { get; set; }
        public List<PerQuantityCost> arrcalPerQuantity { get; set; }
        public List<PerQuantityCost> arrcalPerQuantityByResource { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    public class ProcessBaseCost
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public int? intnPkFinalCost { get; set; }
        public int intPkCalculation { get; set; }
        public String strCalName { get; set; }
        public double numCost { get; set; }
        public double numFinalCost { get; set; }
        public String strDescription { get; set; }
        public bool boolManyRowsInFinalTable { get; set; }
        public int intPkAccountMovement { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    public class PerQuantityCost
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public int? intnPkFinalCost { get; set; }
        public int? intnPkCalculation { get; set; }
        public int? intnPkResource { get; set; }
        public int? intnPkEleetOrEleele { get; set; }
        public bool? boolnIsEleet { get; set; }
        public double numQuantity { get; set; }
        public double? numnFinalQuantity { get; set; }
        public String strUnit { get; set; }
        public String strResOrCalName { get; set; }
        public double numCost { get; set; }
        public double numCostWithFinalQuantity { get; set; }
        public double numFinalCost { get; set; }
        public String strDescription { get; set; }
        public bool boolManyRowsInFinalTable { get; set; }
        public int intPkAccountMovement { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
