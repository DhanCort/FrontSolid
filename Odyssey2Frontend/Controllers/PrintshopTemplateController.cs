/*TASK RP. PROCESS TEMPLATE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

namespace Odyssey2Frontend.Controllers
{
    public class PrintshopTemplateController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //-------------------------------------------------------------------------------------------------------------
        public PrintshopTemplateController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> Index(String strResOrPro)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?strPrintshopId=" + this.strPrintshopId
                + "&strResOrPro=" + strResOrPro);

            List<PrintshopProcessTemplateModel> darrstrProcessType = new List<PrintshopProcessTemplateModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrstrProcessType = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    await subGetPrintshopXJDFProcess();
                }
            }
            
            ViewBag.strPrintshopId = this.strPrintshopId;
            return View(darrstrProcessType);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<String> AddTypeToPrintshop(int intTypePk)
        {
            var model = new
            {
                strPrintshopId = this.strPrintshopId,
                intTypePk = intTypePk
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpContent content = new StringContent(JsonSerializer.Serialize(model),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/AddTypeToPrintshop", content);

            HttpStatusCode status = response.StatusCode;

            String strResponse = await response.Content.ReadAsStringAsync();
            return strResponse;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult> AddCustomProcessToPrintshop(PrintshopProcessTemplateModel model)
        {
            model.strPrintshopId = this.strPrintshopId;
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(model),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/AddNewCustomProcess", content);

            if (response.IsSuccessStatusCode)
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);
                
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> AddTypeOrTemplateToProcess(ResourceToProcessModel resourceToProcess)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpContent content = new StringContent(JsonSerializer.Serialize(resourceToProcess),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/AddTypeOrTemplateToProcess", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                int intPkProcess = 0;
                String strResponse = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200 &&
                    ((JsonElement)jsonResponseModel.objResponse).TryGetInt32(out intPkProcess)
                    )
                {
                    jsonResponseModel.objResponse = intPkProcess;
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddCustomTypeToProcess(ResourceToProcessModel resourceToProcess)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            resourceToProcess.strPrintshopId = this.strPrintshopId;

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpContent content = new StringContent(JsonSerializer.Serialize(resourceToProcess),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/AddCustomTypeToProcess", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                int intPkProcess = 0;
                String strResponse = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200 &&
                    ((JsonElement)jsonResponseModel.objResponse).TryGetInt32(out intPkProcess)
                    )
                {
                    jsonResponseModel.objResponse = intPkProcess;
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetTypeOrTempFromFilter(
            bool boolIsType, bool boolIsTemplate, bool boolIsPhysical, bool boolIsNotPhysical, bool boolIsSuggested,
            int intPkType
            )
        {
            List<ResourceModel> darrresModel = await GetTypeOrTemp(boolIsType, boolIsTemplate, boolIsPhysical,
                boolIsNotPhysical, boolIsSuggested, intPkType);

            return base.Ok(darrresModel);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> GetProcessTypeOfResources(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Type/GetProcessTypesOfResources" +
                $"?intPk=" + intPk);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                List<TemplateModel> darrProcessAndResources = JsonSerializer.Deserialize<List<TemplateModel>>(strResult);

                aresult = Ok(darrProcessAndResources);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> GetPrintshopProcessWithTypesAndTemplates(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopProcessWithTypesAndTemplates?strPrintshopId=" + this.strPrintshopId
                + "&intPk=" + intPk);

            PrintshopProcessTemplateModel resourcesTemplate = new PrintshopProcessTemplateModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<PrintshopProcessTemplateModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult; ;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<List<ResourceModel>> GetProcessSuggestedResources(String intPk)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetProcessSuggestedResources?strPrintshopId=" + this.strPrintshopId
                + "&intPk=" + intPk);

            List<ResourceModel> darrstrResourcesTemplate = new List<ResourceModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();

                darrstrResourcesTemplate = JsonSerializer.Deserialize<List<ResourceModel>>(result);
            }

            return darrstrResourcesTemplate.GroupBy(x => x.strTypeId).Select(x => x.First()).ToList();
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<String> ValidateUsage(String intPk, int intPkSuggested)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetProcessSuggestedResources?strPrintshopId=" + this.strPrintshopId
                + "&intPk=" + intPk);

            List<ResourceModel> darrstrResourcesTemplate = new List<ResourceModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();

                darrstrResourcesTemplate = JsonSerializer.Deserialize<List<ResourceModel>>(result)
                    .Where(w => w.intPk == intPkSuggested).ToList();
            }

            String strUsage = darrstrResourcesTemplate != null ? darrstrResourcesTemplate.FirstOrDefault().strUsage : "";
            if (darrstrResourcesTemplate.Count > 1)
            {
                strUsage = "";
            }

            return strUsage;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> IsModifiable(ResourceToProcessModel restopromodel)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Process/IsModifiable"),
                Content = new StringContent(JsonSerializer.Serialize(restopromodel),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetBoolean();

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> IsDispensable(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Process/IsDispensable?intPk={intPk}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetBoolean();

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> DeleteProcessFromPrintshop(int intPkProcess)
        {
            ActionResult aresult = BadRequest("Invalid data.");
            var model = new
            {
                strPrintshopId = this.strPrintshopId,
                intPkProcess = intPkProcess
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpContent content = new StringContent(JsonSerializer.Serialize(model),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/DeleteProcessFromPrintshop", content);

            if (response.IsSuccessStatusCode)
            {
                String strResponse = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> InputOrOutputIsDispensable(
            PrintshopProcessTemplateModel2 printshopProcessTemplateModel2
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings:" +
                "serviceAddress") + $"/Process/InputOrOutputIsDispensable?" +
                $"intPkEleetOrEleele={printshopProcessTemplateModel2.intPkEleetOrEleele}" +
                $"&boolIsEleet={printshopProcessTemplateModel2.boolIsEleet}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.objResponse != null
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetBoolean();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> DeleteTypeOrTemplate(
            PrintshopProcessTemplateModel2 printshopProcessTemplateModel2
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(printshopProcessTemplateModel2),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Process/DeleteTypeOrTemplate", content);

            if (response.IsSuccessStatusCode)
            {
                int intPkProcess = 0;
                String strResponse = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200 &&
                    ((JsonElement)jsonResponseModel.objResponse).TryGetInt32(out intPkProcess)
                    )
                {
                    jsonResponseModel.objResponse = intPkProcess;
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> GetProcesses(int intPkProcessType, String strTypeId)
        {
            ViewBag.strTypeId = strTypeId;
            ViewBag.intPkProcessType = intPkProcessType;
            ActionResult aresult = RedirectToAction("Index", new { strResOrPro = "Process" });

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetProcessesOfAProcessType?intPkProcessType=" + intPkProcessType);

            List<PrintshopProcessTemplateModel> darrstrProcessType = new List<PrintshopProcessTemplateModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrstrProcessType = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    if (
                        darrstrProcessType != null && darrstrProcessType.Count > 0
                        )
                    {
                        List<ResourceModel> darrresmod = await GetTypeOrTemp(true, true, true, true, false, -1);
                        ViewBag.PrintshopXJDFResources = new SelectList(darrresmod.Select(
                                s => new SelectListItem
                                {
                                    Value = s.intPk + "|" + s.boolIsType.ToString().ToLower(),
                                    Text = s.strTypeId
                                }
                            ),
                            "Value", "Text");

                        aresult = View(darrstrProcessType);
                    }
                }

                ViewBag.intPkProcessType = intPkProcessType;
                ViewBag.strTypeId = strTypeId;
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> Add(PrintshopProcessTemplateModel printshopProcessTemplateModel)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            printshopProcessTemplateModel.strPrintshopId = this.strPrintshopId;
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(printshopProcessTemplateModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Process/Add", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> EditName(int intPkProcess, String strProcessName)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            object objProcess = new
            {
                intPkProcess = intPkProcess,
                strProcessName = strProcessName
            }; 

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(objProcess),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Process/EditName", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<List<ResourceModel>> GetTypeOrTemp(
            bool boolIsType, bool boolIsTemplate, bool boolIsPhysical, bool boolIsNotPhysical, bool boolIsSuggested,
            int intPkType
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Type/GetPrintshopTypesOrTemplates?strPrintshopId={this.strPrintshopId}&" +
                $"boolIsType={boolIsType}&boolIsTemplate={boolIsTemplate}&" +
                $"boolIsPhysical={boolIsPhysical}&boolIsNotPhysical={boolIsNotPhysical}" +
                $"&boolIsSuggested={boolIsSuggested}&intPkProcessType={intPkType}");

            List<ResourceModel> darrresModel = new List<ResourceModel>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrresModel = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrresModel;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<ResourceModel>> GetPrintshopTypeOfResources(String strResOrPro)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?strPrintshopId=" + this.strPrintshopId
                + "&strResOrPro=" + strResOrPro + "&boolnIsPhysical=null");

            List<ResourceModel> darrstrResourcesTemplate = new List<ResourceModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrstrResourcesTemplate = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrstrResourcesTemplate;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetPrintshopXJDFProcess()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopXJDFProcess");

            List<PrintshopProcessTemplateModel> darrstrProcessTemplate = new List<PrintshopProcessTemplateModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    ) 
                {
                    darrstrProcessTemplate = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            ViewBag.PrintshopXJDFProcess = darrstrProcessTemplate;
            ViewBag.darrstrXJDFProcessClassification = darrstrProcessTemplate
                .GroupBy(process => new { process.strClassification })
                .Select(process => process.Key.strClassification)
                .Where(process => process != null)
                .OrderByDescending(process => process)
                .ToList();
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
