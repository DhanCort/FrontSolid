/*TASK RP. WORKFLOW*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Peña).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: February 27, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class WorkflowController : BaseController
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public WorkflowController(AppSessionContext requestHandler, IConfiguration configuration) :
            base(requestHandler, configuration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index(int intPkWorkflow, int intPkProduct)
        {
            ViewBag.intPkWorkflow = intPkWorkflow;
            ViewBag.intnPkProduct = intPkProduct;
            if (
                intPkProduct == 0
                )
            {
                ViewBag.intnPkProduct = null;
            }

            ViewBag.boolFromScratch = false;
            ViewBag.selectListProcessType = await subGetPrintshopProcess();
            await subGetWorkflowNodes(intPkWorkflow);
            await subGetProcessGroups();
            //await subGetWorkflowProcess(intPkWorkflow);

            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetWorkflow(
            int intPkWorkflow
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Workflow/GetWorkflow?" +
                "intPkWorkflow=" + intPkWorkflow);

            JsonResponseModel jsonres = new JsonResponseModel(200, "Something is wrong.", "", null, false, "",
                false, null, null);

            if (
                response.IsSuccessStatusCode                //true
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonres.intStatus == 200
                    )
                {
                    jsonres.objResponse = JsonSerializer
                        .Deserialize<JobWorkflowJobModel>(jsonres.objResponse.ToString());

                    aresult = base.Ok(jsonres);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetLinkView(
            int intPkWorkflow,
            int? intnPkProduct
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            await subGetProcessesAndNodes(intPkWorkflow);
            List<linkModel> darrlink = await darrlinkGetLinks(intPkWorkflow);

            ViewBag.intnPkProduct = intnPkProduct;
            aresult = PartialView("LinkPartialView", darrlink);

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddNewProcess(
            int intPkProcess,
            int intPkWorkflow,
            int intPkProduct,
            bool boolEstimate
            )
        {
            var data = new
            {
                intPkProcess = intPkProcess,
                intPkWorkflow = intPkWorkflow
            };

            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(data),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/workflow/AddProcess", content);

            ObjectAddedNewProcessModel objectWorkflow = new ObjectAddedNewProcessModel();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponse.intStatus == 200 && !boolEstimate)
                {
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetInt32();

                    jsonResponse.objResponse = Url.Action("Index", "Workflow", new
                    {
                        intPkWorkflow = jsonResponse.objResponse,
                        intPkProduct = intPkProduct
                    });
                }
                else
                {
                    jsonResponse.objResponse = null;
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddNode(int intPkWorkflow)
        {
            var data = new
            {
                intPkWorkflow = intPkWorkflow
            };

            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(data),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/workflow/AddNode", content);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "", "", null, false, "", false, null, null);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse)
                        .GetProperty("intPkWorkflowFinal").GetInt32();
                }
            }

            aresult = base.Ok(jsonResponse);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTypeOrTemplateAllResources
            (
                int intPk,
                bool boolIsType,
                int? intnJobId,
                int intPkProcessInWorkflow
            )
        {
            IActionResult aresult = base.BadRequest("");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Resource/GetTypeOrTemplateAllResources?strPrintshopId=" + this.strPrintshopId
                + $"&intPkEleetOrEleele={intPk}&boolIsEleet={boolIsType}&" +
                $"intnJobId={intnJobId}&intPkProcessInWorkflow={intPkProcessInWorkflow}");

            SelectList selectListProcessType = new SelectList(new List<SelectListItem>());
            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                    .Deserialize<List<ResourcesByProcessModel>>(jsonResponseModel.objResponse.ToString());
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetResource(SetResourceOnWorkflowModel setResourceOnWorkflowModel)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(setResourceOnWorkflowModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/AddResourceAndGroup", content);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<InputOutputResourcesModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> WorkflowLink(
            LinkResource linkResource
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(linkResource),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/Link", content);

            JsonResponseModel jsonResponseModel = new JsonResponseModel(400, "Something is wrong.", "", null,
                false, "", false, null, null);
            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse)
                        .GetProperty("intPkWorkflow").GetInt32();
                }
            }

            aresult = base.Ok(jsonResponseModel);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetLinks(int intPk)
        {
            List<linkModel> darrlink = await darrlinkGetLinks(intPk);

            return PartialView("LinksTablePartialView", darrlink);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Unlink(linkModel linkModel)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(linkModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/Unlink", content);

            if (
                response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetInt32();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> ProcessOrNodeIsDispensable(
            int? intnPkProcessInWorkflow = null,
            int? intnPkNode = null
            )
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intnPkProcessInWorkflow = intnPkProcessInWorkflow,
                intnPkNode = intnPkNode
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/ProcessOrNodeIsDispensable?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponseModel.objResponse != null)
                {
                    JsonElement jsonElement = (JsonElement)jsonResponseModel.objResponse;
                    jsonResponseModel.objResponse = jsonElement.GetBoolean();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> DeleteProcess(
            NodeModel nodeModel
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(nodeModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/DeleteProcess", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200 &&
                    !nodeModel.boolEstimate
                    )
                {
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetInt32();

                    jsonResponse.objResponse = Json(Url.Action("Index", "Workflow", new
                    {
                        intPkWorkflow = jsonResponse.objResponse,
                        intPkProduct = nodeModel.intPkProduct
                    }));
                }
                else
                {
                    jsonResponse.objResponse = null;
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetWorkflowInformation(int intPkWorkflow)
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Workflow/GetWorkflowInformation/?intPkWorkflow={intPkWorkflow}");

            JsonResponseModel jsonResponseModel = new JsonResponseModel();

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<NeededResourcesAndUnlinkModel>(jsonResponseModel.objResponse.ToString());
            }

            return PartialView("NeededResourcesAndUnlinkProcessesPartialView", jsonResponseModel);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetResourcesForIO(
            int intPkProcessInWorkflow,
            int intPkEleetOrEleele,
            bool boolIsEleet,
            bool boolAddCalculations,
            bool boolIsDeviceToolOrCustom,
            bool boolIsCustom,
            bool boolIsOutput
            )
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Workflow/GetResourcesForIO?"
                + $"intPkProcessInWorkflow={intPkProcessInWorkflow}&"
                + $"intPkEleetOrEleele={intPkEleetOrEleele}&boolIsEleet={boolIsEleet}");

            JsonResponseModel jsonResponseModel = new JsonResponseModel();

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                //String result = "{\"intStatus\":200,\"strUserMessage\":\"There are resources.\",\"strDevMessage\":\"There areresources.\",\"objResponse\":[{\"intPk\":4,\"strName\":\"Cutting Params A\"}]}";
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<InputOutputResourcesModel>>(jsonResponseModel.objResponse.ToString());
            }

            ViewBag.boolIsOutput = boolIsOutput;
            ViewBag.boolAddCalculations = boolAddCalculations;
            ViewBag.boolIsDeviceToolOrCustom = boolIsDeviceToolOrCustom;
            ViewBag.boolIsCustom = boolIsCustom;
            return PartialView("IOResourcesPartialView", jsonResponseModel.objResponse);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> DeleteResourcesForIO(DeleteResourceOnWorkflowModel workflowModel)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(workflowModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/DeleteResourcesForIO", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetInt32();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetFinalProduct(
            FinalProduct finalproduct
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(finalproduct),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/SetFinalProduct", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200 && !finalproduct.boolEstimate
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<int>(jsonResponseModel.objResponse.ToString());
                }
                else
                {
                    jsonResponseModel.objResponse = null;
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> HasNotCalculations(
            Size ioSize
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                   + $"/Workflow/HasNotCalculations?{ioSize}"),
                Content = new StringContent(JsonSerializer.Serialize(ioSize),
               Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
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
        public async Task<IActionResult> SetSize(
            Size ioSize
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(ioSize),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + "/Workflow/SetSize", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<int>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> ResourceIsDispensable(DeleteResourceOnWorkflowModel workflowModel)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpRequestMessage request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/ResourceIsDispensable"),
                Content = new StringContent(JsonSerializer.Serialize(workflowModel),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<ResourceIsDispensable>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> ResourceIsAddable(AddResourceOnWorkflowModel workflowModel)
        {
            workflowModel.intPkResource = (workflowModel.intPkResource == 0) ? workflowModel.intnPkResource :
                workflowModel.intPkResource;
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpRequestMessage request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/ResourceIsAddable"),
                Content = new StringContent(JsonSerializer.Serialize(workflowModel),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetBoolean();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> RenameWorkflow(RenameWorkflowModel renameWorkflowModel)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(renameWorkflowModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/UpdateName", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                ViewBag.strTypeId = renameWorkflowModel.strWorkflowName;
                ViewBag.intPkWorkflow = renameWorkflowModel.intPkWorkflow;

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessIOs(
            int intPkProcessInWorkflow,
            bool boolIsInput
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings" +
                ":serviceAddress") + $"/Workflow/GetProcessIOs?intPkProcessInWorkflow={intPkProcessInWorkflow}" +
                $"&boolIsInput={boolIsInput}");

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "", "", null, false, "", false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<List<ProcessIOModel>>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> IsModifiable(
            int intPkWorkflow_I
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings" +
                ":serviceAddress") + $"/Workflow/IsModifiable?intPkWorkflow={intPkWorkflow_I}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetBoolean();

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessDetails(
            int intPkProcessInWorkflow_I,
            bool boolGeneric_I,
            bool boolSuperAdmin_I,
            bool boolHasSize_I
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings" +
                ":serviceAddress") + $"/Workflow/GetProcessDetails?intPkProcessInWorkflow={intPkProcessInWorkflow_I}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponse);
                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<WorkflowModel>(
                        jsonResponse.objResponse.ToString());

                    ViewBag.boolGeneric = boolGeneric_I;
                    ViewBag.boolSuperAdmin = boolSuperAdmin_I;
                    ViewBag.boolHasSize = boolHasSize_I;
                    aresult = PartialView("NewProcessPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetConditionToLink(
            LinkSetConditionModel linkSetConditionModel
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(linkSetConditionModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/SetConditionToLink", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                if (
                    jsonResponseModel.objResponse != null
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetInt32();
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetAsThickness(
            SetThicknessModel setThicknessModel
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(setThicknessModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/SetAsThickness", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTransformCalculation(
            int? intnPk,
            int? intnJobId,
            String strTypeTemplateAndResourceO,
            int intPkProcessInWorkflow,
            String strUnitO,
            int intPkEleetOrEleeleO,
            bool boolIsEleetO,
            int? intnPkResourceO,
            bool boolIsAbleToSave,
            bool boolCustomWorkflow
            )
        {
            IActionResult aresult = BadRequest();
            //                                              //Get all transfor calculations.
            List<TranformationCalculationModel> darrtracal = await darrtracalGetTransformCalculations(intnJobId,
                intPkProcessInWorkflow);

            //                                              //Set all the necessary data for the partial view that have 
            //                                              //      the form and the informative table.
            ViewBag.boolCustomWorkflow = boolCustomWorkflow;
            ViewBag.strUnitO = strUnitO;
            ViewBag.boolIsEleetO = boolIsEleetO;
            ViewBag.intnPkResourceO = intnPkResourceO;
            ViewBag.boolIsAbleToSave = boolIsAbleToSave;
            ViewBag.intPkEleetOrEleeleO = intPkEleetOrEleeleO;
            ViewBag.intPkProcessInWorkflow = intPkProcessInWorkflow;
            ViewBag.strTypeTemplateAndResourceO = strTypeTemplateAndResourceO;
            List<WorkflowProcessInputModel> darrwfproimodel = await subGetProcessInputs(intPkProcessInWorkflow,
                intnPkResourceO, intnJobId, intPkEleetOrEleeleO, boolIsEleetO, false);
            ViewBag.WorkflowProcessInputListItems = darrwfproimodel.Where(i => i.boolIsInput == true);

            //                                              //Set the object with the view.
            aresult = PartialView("OutputCalculationPartialView", darrtracal);

            //                                              //Return the view.
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAllTransformCalculation(
            int? intnJobId,
            int intPkProcessInWorkflow
            )
        {
            IActionResult aresult = BadRequest();

            List<TranformationCalculationModel> darrtracal = await darrtracalGetTransformCalculations(intnJobId,
                intPkProcessInWorkflow);

            aresult = PartialView("TransformCalculationTablePartialView", darrtracal);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOneTransform(
            int? intnPk
            )
        {
            IActionResult aresult = base.BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + 
                $"/Calculation/GetOneTransform?intnPk={intnPk}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<TranformationCalculationModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeleteTransform(
            int intPk
            )
        {
            IActionResult aresult = base.BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new { 
                intPk = intPk
            }), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/DeleteTransform", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessesByProcessType(int intPkProcessGroup)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetProcessesOfAProcessType?intPkProcessType=" + intPkProcessGroup);

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
                    List<PrintshopProcessTemplateModel> darrprintshopProcess = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    jsonResponseModel.objResponse = new SelectList(darrprintshopProcess.Select(
                            s => new SelectListItem
                            {
                                Value = s.intPk.ToString(),
                                Text = s.strElementName
                            }
                        ),
                        "Value", "Text");
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllProcess()
        {
            return base.Ok(await subGetPrintshopProcess());
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<SelectList> subGetPrintshopProcess()
        {

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetPrintshopProcesses?strPrintshopId=" + this.strPrintshopId);

            SelectList selectListProcessType = new SelectList(new List<SelectListItem>());
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
                    List<PrintshopProcessTemplateModel> darrprintshopProcess = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    selectListProcessType = new SelectList(darrprintshopProcess.Select(
                            s => new SelectListItem
                            {
                                Value = s.intPk.ToString(),
                                Text = s.strElementName
                            }
                        ),
                        "Value", "Text");
                }
            }

             return selectListProcessType;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetWorkflowProcess(int intPk)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/get?intPkWorkflow=" + intPk);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse = JsonSerializer.Deserialize<JobWorkflowJobModel>(jsonResponse.objResponse.ToString());
            }

            ViewBag.objectWorkflow = jsonResponse;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetProcessesAndNodes(
            int intPkWorkflow
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/GetProcessesAndNodes?intPkWorkflow=" + intPkWorkflow);

            List<NodeModel> darrnodemodNodesAndProcesses = new List<NodeModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    darrnodemodNodesAndProcesses = JsonSerializer
                        .Deserialize<List<NodeModel>>(jsonResponse.objResponse.ToString());

                }
            }

            ViewBag.darrnodemodNodesAndProcesses = darrnodemodNodesAndProcesses;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<List<linkModel>> darrlinkGetLinks(
            int intPkWorkflow
            )
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Workflow/GetLinks?intPkWorkflow={intPkWorkflow}");

            List<linkModel> darrlinkmod = new List<linkModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrlinkmod = JsonSerializer
                        .Deserialize<List<linkModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrlinkmod;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task subGetWorkflowNodes(int intPkWorkflow)
        {

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/GetNodes?intPkWorkflow=" + intPkWorkflow);

            SelectList selectListNodes = new SelectList(new List<SelectListItem>());
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
                    List<NodeModel> darrworkflowNodes = JsonSerializer
                        .Deserialize<List<NodeModel>>(jsonResponseModel.objResponse.ToString());

                    selectListNodes = new SelectList(darrworkflowNodes.Select(
                            s => new SelectListItem
                            {
                                Value = s.intnPkNode.ToString(),
                                Text = s.strName
                            }
                        ),
                        "Value", "Text");
                }
            }

            ViewBag.selectListNodes = selectListNodes;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<List<WorkflowProcessInputModel>> subGetProcessInputs(
            int intPkProcessInWorkflow,
            int? intnPkResource,
            int? intnJobId,
            int intPkeleetOrEleele,
            bool boolIsEteel,
            bool boolWithJob
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intnJobId = intnJobId,
                intPkProcessInWorkflow = intPkProcessInWorkflow,
                intPkeleetOrEleele = intPkeleetOrEleele,
                boolIsEleet = boolIsEteel,
                intPkResource = intnPkResource
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/GetProcessInputs?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            List<WorkflowProcessInputModel> darrproinp = new List<WorkflowProcessInputModel>();

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrproinp = JsonSerializer
                        .Deserialize<List<WorkflowProcessInputModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrproinp;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<List<TranformationCalculationModel>> darrtracalGetTransformCalculations(
            int? intnJobId,
            int intPkProcessInWorkflow
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                $"/Calculation/GetTransformCalculations?intnJobId={intnJobId}&intPkProcessInWorkflow={intPkProcessInWorkflow}");

            List<TranformationCalculationModel> darrtracal = new List<TranformationCalculationModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrtracal = JsonSerializer.Deserialize<List<TranformationCalculationModel>>(
                        jsonResponseModel.objResponse.ToString());
                }
            }

            return darrtracal;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task subGetProcessGroups()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?strPrintshopId=" + this.strPrintshopId
                + "&strResOrPro=Process");

            SelectList selectListProcessGroups = new SelectList(new List<SelectListItem>());
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
                    List<PrintshopProcessTemplateModel> darrstrProcessType = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    selectListProcessGroups = new SelectList(darrstrProcessType.Select(
                            processGroup => new SelectListItem
                            {
                                Value = processGroup.intPk.ToString(),
                                Text = processGroup.strTypeId
                            }
                        ),
                        "Value", "Text");
                }
            }

            ViewBag.selectListProcessGroups = selectListProcessGroups;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
