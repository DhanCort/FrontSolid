/*TASK RP.PRODUCT*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Sep 03, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PaperTransformationModel
    {
        public double numWidth { get; set; }
        public double? numnHeight { get; set; }
        public double numCutWidth { get; set; }
        public double numCutHeight { get; set; }
        public double? numnMarginTop { get; set; }
        public double? numnMarginBottom { get; set; }
        public double? numnMarginLeft { get; set; }
        public double? numnMarginRight { get; set; }
        public double? numnVerticalGap { get; set; }
        public double? numnHorizontalGap { get; set; }
        public bool boolIsOptimized { get; set; }
        public bool boolCut { get; set; }
        public int intPkResource { get; set; }
    }

    //==================================================================================================================
    public class SavePaperTransformationModel
    {
        public int? intnPkPaTrans { get; set; }
        public int? intnPkCalculation { get; set; }
        public double numWidth { get; set; }
        public double? numnHeight { get; set; }
        public double numCutWidth { get; set; }
        public double numCutHeight { get; set; }
        public double? numnMarginTop { get; set; }
        public double? numnMarginBottom { get; set; }
        public double? numnMarginLeft { get; set; }
        public double? numnMarginRight { get; set; }
        public double? numnVerticalGap { get; set; }
        public double? numnHorizontalGap { get; set; }

        public String strUnit { get; set; }
        public bool boolIsEleetI { get; set; }
        public int intPkEleetOrEleeleI { get; set; }
        public int intPkResourceI { get; set; }
        public bool boolIsEleetO { get; set; }
        public int intPkEleetOrEleeleO { get; set; }
        public int intPkResourceO { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public bool boolIsOptimized { get; set; }
        public bool boolCut { get; set; }
    }

    //==================================================================================================================
    public class GetPaperTransformationInModel
    {
        public int? intnPkPaTrans { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public int intPkResource { get; set; }
        public int? intnJobId { get; set; }
        public bool boolIsEleetO { get; set; }
        public int intPkEleetOrEleeleO { get; set; }
    }

    //==================================================================================================================
    public class GetPaperTransformationOutModel
    {
        public int intPkPaTrans { get; set; }
        public double numWidth { get; set; }
        public double? numnHeight { get; set; }
        public double numCutWidth { get; set; }
        public double numCutHeight { get; set; }
        public double? numnMarginTop { get; set; }
        public double? numnMarginBottom { get; set; }
        public double? numnMarginLeft { get; set; }
        public double? numnMarginRight { get; set; }
        public double? numnVerticalGap { get; set; }
        public double? numnHorizontalGap { get; set; }
        public String strUnit { get; set; }
        public bool boolInputIsChangeable { get; set; }
        public List<CutsPaperTransformationModel> arrrow { get; set; }
        public bool boolIsReversed { get; set; }
        public bool boolIsOptimized { get; set; }
        public bool boolPostSize { get; set; }
        public bool boolCut { get; set; }
    }

    //==================================================================================================================
    public class CalculatedCutsPaperTransformationModel
    {
        public double numPerUnit { get; set; }
        public double numNeeded { get; set; }
        public bool boolIsReversed { get; set; }
        public List<CutsPaperTransformationModel> arrrow { get; set; }
    }

    //==================================================================================================================
    public class CutsPaperTransformationModel
    {
        public double numheight { get; set; }
        public List<CellCutsPaperTransformationModel> arrcell { get; set; }
    }

    //==================================================================================================================
    public class CellCutsPaperTransformationModel
    {
        public double numwidth { get; set; }
        public bool boolIsWaste { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
