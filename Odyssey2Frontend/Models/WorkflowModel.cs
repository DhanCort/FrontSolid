/*TASK RP.WORKFLOW*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: February 28, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class NewWorkflowModel
    {
        public int? intnPkProduct { get; set; }
        public String strWorkflowName { get; set; }
        public int? intnPkWorkflow { get; set; }
        public List<int> arrintPkPiw { get; set; }
    }

    //==================================================================================================================
    public class ProductWorkflow
    {
        public int intPkWorkflow { get; set; }
        public String strName { get; set; }
        public bool boolIsDefault { get; set; }
        public bool boolUsed { get; set; }
        public String strWarningMessage { get; set; }
        public bool boolStillValid { get; set; }
        public bool boolNewVersion { get; set; }
    }

    //==================================================================================================================

    public class ObjectWorkflowModel
    {
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public JobWorkflowJobModel objResponse { get; set; }
    }

    //==================================================================================================================
    public class ObjectAddedNewProcessModel
    {
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public List<WorkflowModel> objResponse { get; set; }
    }

    //==================================================================================================================
    public class JobWorkflowJobModel
    {
        public List<LinkModel> arrlkornodjson { get; set; }
        public List<WorkflowModel> arrpro { get; set; }
        public List<WorkflowModel> darrpiwjson { get; set; }
        public bool boolIsReady { get; set; }
        public bool boolGeneric { get; set; }
        public string strWorkflowName { get; set; }
        public bool boolHasFinalProduct { get; set; }
        public int intPk { get; set; }
        public int intPkWorkflow { get; set; }
        public int intPkProduct { get; set; }
        public bool boolHasSize { get; set; }
    }

    //==================================================================================================================
    public class WorkflowModel
    {
        public int intPkProcessInWorkflow { get; set; }
        public String strName { get; set; }
        public bool boolHasCalculations { get; set; }
        public double numCostByProcess { get; set; }
        public int intPkProcessType { get; set; }
        public int intPkProcess { get; set; }
        public String strNameProcessType { get; set; }
        public int intStage { get; set; }
        public bool? boolnCanStartProcess { get; set; }
        public List<ResourceOrTemplateModel> arrresortypInput { get; set; }
        public List<ResourceOrTemplateModel> arrresortypOutput { get; set; }
        public int intPkProduct { get; set; }
        public int intHours { get; set; }
        public int intMinutes { get; set; }
        public int intSeconds { get; set; }
        public bool? boolnCanBeCompleted { get; set; }
        public bool boolIsNormal { get; set; }
        public bool boolIsPostProcess { get; set; }
        public bool boolContainsFinalProduct { get; set; }
    }

    //==================================================================================================================
    public class ResourceOrTemplateModel
    {
        public int intPkType { get; set; }
        public int? intnPkTemplate { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public String strTypeAndTemplate { get; set; }
        public String strResource { get; set; }
        public String strLink { get; set; }
        public int? intnPkResource { get; set; }
        public double numQuantity { get; set; }
        public String strUnit { get; set; }
        public double numCostByResource { get; set; }
        public bool boolIsPhysical { get; set; }
        public bool? boolnIsCalendar { get; set; }
        public bool? boolnIsAvailable { get; set; }
        public int intHours { get; set; }
        public int intMinutes { get; set; }
        public int intSeconds { get; set; }
        public bool boolIsDeviceToolOrCustom { get; set; }
        public bool boolAutomaticallySet { get; set; }
        public bool boolIsOneResource { get; set; }
        public bool boolHasNotResource { get; set; }
        public bool boolIsCustom { get; set; }
        public bool? boolnIsFinalProduct { get; set; }
        public bool boolIsFinalProduct { get; set; }
        public List<WasteModel> arrwstWaste { get; set; }
        public List<WasteAdditionalModel> arrwstaddWasteAdditional { get; set; }
        public String strDimensions { get; set; }
        public bool boolIsPaper { get; set; }
        public bool boolnIsDeviceOrMiscConsumable { get; set; }
        public bool boolSize { get; set; }
        public bool? boolnSize { get; set; }
        public bool boolComponent { get; set; }
        public bool boolThickness { get; set; }
        public bool boolMedia { get; set; }
    }

    //==================================================================================================================
    public class WasteModel
    {
        public double numInitial { get; set; }
        public double numWaste { get; set; }
        public double numTotal { get; set; }
        public double? numnWasteToPropagate { get; set; }
        public String strUnitPropagate { get; set; }
        public String strTarget { get; set; }
    }

    //==================================================================================================================
    public class WasteAdditionalModel
    {
        public double numWasteAdditional { get; set; }
        public String strSource { get; set; }
    }

    //==================================================================================================================
    public class SetResourceOnWorkflowModel
    {
        public int intJobId { get; set; }

        public int intPkProcessInWorkflow { get; set; }

        public int intPkResource { get; set; }

        public int? intnPkResource { get; set; }

        public int intPkEleetOrEleele { get; set; }

        public bool boolIsEleet { get; set; }
    }

    //==================================================================================================================
    public class DeleteResourceOnWorkflowModel
    {
        public int intJobId { get; set; }

        public int intPkProcessInWorkflow { get; set; }

        public int intPkResource { get; set; }

        public int intPkEleetOrEleele { get; set; }

        public bool boolIsEleet { get; set; }
    }

    //==================================================================================================================
    public class AddResourceOnWorkflowModel
    {
        public int intJobId { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public int intnPkResource { get; set; }
        public int intPkResource { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
    }

    //==================================================================================================================
    public class LinkResource
    {
        public int? intnPkProcessInWorkflowO { get; set; }
        public int? intnPkEleetOrEleeleO { get; set; }
        public int? intnPkNodeO { get; set; }
        public bool? boolnIsEleetO { get; set; }
        public int? intnPkProcessInWorkflowI { get; set; }
        public int? intnPkEleetOrEleeleI { get; set; }
        public bool? boolnIsEleetI { get; set; }
        public int? intnPkNodeI { get; set; }
        public String strConditionToApply { get; set; }
        public double? numnSuperiorLimit { get; set; }
        public double? numnInferiorLimit { get; set; }
        public bool boolConditionAnd { get; set; }
        public string condition { get; set; }
    }

    //==================================================================================================================
    public class UnlinkModel
    {
        public int intPkWorkflow { get; set; }

        public int intPk { get; set; }

        public String strName { get; set; }

        public String strLink { get; set; }
    }

    //==================================================================================================================
    public class linkModel
    {
        public int intPkOut { get; set; }
        public int intPkIn { get; set; }
        public String strProcessFrom { get; set; }
        public String strOut { get; set; }
        public String strProcessTo { get; set; }
        public String strIn { get; set; }
        public String strConditionToApply { get; set; }
        public double? numnMinQty { get; set; }
        public double? numnMaxQty { get; set; }
        public bool boolSetCondition { get; set; }
        public bool boolConditionAnd { get; set; }
    }
    
    //==================================================================================================================
    public class LinkSetConditionModel
    {
        public int intPkOut { get; set; }
        public int intPkIn { get; set; }
        public String condition { get; set; }
        public String strConditionToApply { get; set; }
        public double? numnInferiorLimit { get; set; }
        public double? numnSuperiorLimit { get; set; }
        public bool boolConditionAnd { get; set; }
    }

    //==================================================================================================================
    public class NeededResourcesAndUnlinkModel
    {
        //public String strResourcesMessage { get; set; }
        //public List<NeededResourcesAndProcessesModel> arrresorprojsonResources { get; set; }
        //public String strProcessMessage { get; set; }
        //public List<NeededResourcesAndProcessesModel> arrresorprojsonProcesses { get; set; }
        //public String strCyclesMessage { get; set; }
        //public bool boolHasCycles { get; set; }
        public String strTips { get; set; }
        public List<String> arrstrProcessName { get; set; }
    }

    //==================================================================================================================
    public class NeededResourcesAndProcessesModel
    {
        public int intPk { get; set; }
        public String strName { get; set; }

    }

    //==================================================================================================================
    public class InputOutputResourcesModel
    {
        public int intPk { get; set; }
        public int intPkWorkflow { get; set; }
        public String strName { get; set; }
        public String strUnit { get; set; }
        public bool boolIsPhysical { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public bool boolIsPaper { get; set; }
        public bool boolIsDeviceOrMiscConsumable { get; set; }
    }

    //==================================================================================================================

    public class RenameWorkflowModel
    {
        public int intPkWorkflow { get; set; }
        public string strWorkflowName { get; set; }
    }

    //==================================================================================================================

    public class ResourceIsDispensable
    {
        public int intPkWorkflow { get; set; }
        public bool boolResourceIsDispensable { get; set; }
        public String strJobs { get; set; }
    }

    //==================================================================================================================
    public class FinalProduct
    {
        public int intPkProcessInWorkflow { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public bool boolIsFinalProduct { get; set; }
        public bool boolEstimate     { get; set; }
    }

    //==================================================================================================================
    public class Size
    {
        public int intPkProcessInWorkflow { get; set; }
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public bool boolSize { get; set; }
    }

    //==================================================================================================================
    public class LinkModel
    {
        public NodeModel nodeFrom { get; set; }
        public NodeModel[] arrnodeTo { get; set; }
    }
    
    //==================================================================================================================
    public class NodeModel
    {
        public int? intnPkProcessInWorkflow { get; set; }
        public int? intnPkNode { get; set; }
        public int intPkProduct { get; set; }
        public String strName { get; set; }
        public bool boolEstimate { get; set; }
    }
    
    //==================================================================================================================
    public class ProcessIOModel
    {
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public String strIO { get; set; }
    }
    
    //==================================================================================================================
    public class SetThicknessModel
    {
        public int intPkEleetOrEleele { get; set; }
        public bool boolIsEleet { get; set; }
        public int intPkProcessInWorkflow { get; set; }
        public bool boolThickness { get; set; }
    }

    //==================================================================================================================
    public class WorkInProgressStatusModel
    {
        public int intJobId { get; set; }
        public String strStatus { get; set; }
        public bool boolSendEmail { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
