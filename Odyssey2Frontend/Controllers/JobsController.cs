/*TASK RP. PROCESS TEMPLATE*/
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Job;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 29, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JobsController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        static JobWorkflowModel jobwfmodel { get; set; }

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public JobsController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index(
            bool? boolnUnsubmitted,
            bool? boolnInEstimating,
            bool? boolnWaitingForPriceApproval,
            bool? boolnPending,
            bool? boolnInProgress,
            bool? boolnCompleted,
            bool? boolnNotPaid
            )
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                boolnUnsubmitted = boolnUnsubmitted,
                boolnInEstimating = boolnInEstimating,
                boolnWaitingForPriceApproval = boolnWaitingForPriceApproval,
                boolnPending = boolnPending,
                boolnInProgress = boolnInProgress,
                boolnCompleted = boolnCompleted,
                boolnNotPaid = boolnNotPaid
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/GetPrintshopJobs?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            String strResult = null;
            List<JobsModel> darrjobs = new List<JobsModel>();
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                strResult = await response.Content.ReadAsStringAsync();

                //                                          //Deserialize the response.
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    //                                      /Deserialize the objResponse;
                    darrjobs = JsonSerializer.Deserialize<List<JobsModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            //                                              //Return the list and data.
            ViewBag.boolnUnsubmitted = boolnUnsubmitted;
            ViewBag.boolnInEstimating = boolnInEstimating;
            ViewBag.boolnWaitingForPriceApproval = boolnWaitingForPriceApproval;
            ViewBag.boolnPendingStage = boolnPending;
            ViewBag.boolnInProgressStage = boolnInProgress;
            ViewBag.boolnCompletedStage = boolnCompleted;
            ViewBag.boolnNotPaid = boolnNotPaid;
            return View(darrjobs);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult> Calculate(int jobId, String name)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            String result = null;
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/CalculateJob?intJobId=" + jobId + "&strPrintshopId=" + this.strPrintshopId);
            JsonResponseModel jsonResponseModel = null;
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                result = await response.Content.ReadAsStringAsync();

                //                                          //Deserializae the response.
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponseModel.objResponse = JsonSerializer.Deserialize<JobsModel>(jsonResponseModel.objResponse.ToString());
            }

            //                                              //Return list.
            return PartialView("Calculation", jsonResponseModel.objResponse);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Workflow(
            int intJobId, 
            int intPkWorkflow,
            bool boolReadOnly
            )
        {
            await subGeJobtWorkflowProcess(intJobId, intPkWorkflow);
            ViewBag.boolFromScratch = false;
            ViewBag.intPkWorkflow = intPkWorkflow;
            ViewBag.strPreviusUrl = Request.Headers["Referer"].ToString();
            ViewBag.boolReadOnly = boolReadOnly;

            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetResourceForAJob(AddResourceOnWorkflowModel workflowModel)
        {
            workflowModel.intPkResource = workflowModel.intnPkResource;
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(workflowModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/SetResourceForAJob", content);

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
        public async Task<IActionResult> SetPriceForAJob(
            JobPriceModel jobPriceModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(jobPriceModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/SetPriceForAJob", content);

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
        [HttpPost]
        public async Task<IActionResult> ResetPriceForAJob(
            int intJobId,
            int? intnEstimateId,
            int intPkWorkflow,
            int? intnCopyNumber
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            object obj = new
            {
                intJobId = intJobId,
                intPkWorkflow = intPkWorkflow,
                intnEstimateId = intnEstimateId,
                intnCopyNumber = intnCopyNumber
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/ResetPrice", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> ModifyJobStagePendingToProgress(int intJobId, int intPkWorkflow)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            object obj = new
            {
                intJobId = intJobId,
                intPkWorkflow = intPkWorkflow
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/ModifyJobStagePendingToProgress", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> UpdateProcessStage(int intPkProcessInWorkflow, int intJobId, int intStage)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            object obj = new
            {
                intPkProcessInWorkflow = intPkProcessInWorkflow,
                intJobId = intJobId,
                intStage = intStage
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/UpdateProcessStage", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonres.intStatus == 200 &&
                    jsonres.objResponse != null
                    )
                {
                    jsonres.objResponse = ((JsonElement)jsonres.objResponse).GetBoolean();
                }
                else
                {
                    jsonres.objResponse = false;
                }

                aresult = base.Ok(jsonres);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProductWorkflows(
            int intPkProduct,
            int? intnJobId,
            bool boolEstimate
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intPkProduct = intPkProduct,
                intnJobId = intnJobId,
                boolEstimate = boolEstimate
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/GetProductWorkflows?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

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
                    List<ProductWorkflow> darrprowf = JsonSerializer
                        .Deserialize<List<ProductWorkflow>>(jsonResponseModel.objResponse.ToString());
                    jsonResponseModel.objResponse = darrprowf;
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> IsPriceChangeable(int intJobId)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/IsPriceChangeable?intJobId=" + intJobId);

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
        public async Task<IActionResult> GetQuantities()
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Job/GetQuantities");

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<QuantitiesModel>>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEstimatesQuantities()
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Job/GetEstimatesQuantities");

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<QuantitiesModel>>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetDueDate(JobDueDateModel jobDueDateModel)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(jobDueDateModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/SetDueDate", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessCostEstimateAndFinalFromJob(int intJobId, int intPkWorkflow)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetProcessCostEstimateAndFinalFromJob?intJobId=" + intJobId
                + "&intPkWorkflow=" + intPkWorkflow);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                //String result = "{\"intStatus\":200,\"strUserMessage\":\"Success.\",\"strDevMessage\":\"\",\"objResponse\":[{\"intPkprocessInWorkflow\":5906,\"strProcessName\":\"Cut Parent to Run Size\",\"numEstimateCost\":8856,\"numFinalCost\":0,\"numCostDifference\":-8856,\"arrresourcecost\":[{\"strResourceName\":\"Recurso 1\",\"numEstimateCost\":50,\"numFinalCost\":100,\"numCostDifference\":50}],\"arrcalculationscost\":[{\"strCalculationName\":\"Cal 1\",\"numEstimateCost\":50,\"numFinalCost\":100,\"numCostDifference\":50}]},{\"intPkprocessInWorkflow\":5907,\"strProcessName\":\"Proceso 2\",\"numEstimateCost\":300,\"numFinalCost\":200,\"numCostDifference\":100,\"arrresourcecost\":[{\"strResourceName\":\"Recurso 2\",\"numEstimateCost\":250,\"numFinalCost\":100,\"numCostDifference\":150}],\"arrcalculationscost\":[{\"strCalculationName\":\"Cal 2\",\"numEstimateCost\":150,\"numFinalCost\":100,\"numCostDifference\":50}]}]}";
                JobFinalCost jobFinalCost = new JobFinalCost();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jobFinalCost = JsonSerializer
                        .Deserialize<JobFinalCost>(jsonResponseModel.objResponse.ToString());
                }

                aresult = PartialView("GeneralCostModalPartialView", jobFinalCost);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> updateCostOrQuantity(UpdateCostOrQuantityModel updateCostOrQuantityModel)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(updateCostOrQuantityModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/updateCostOrQuantity", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }


        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessFinalCostData(int intPkProcessInWorkflow, int intJobId,
            int intPkProduct)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetProcessFinalCostData?intJobId=" + intJobId + "&intPkProcessInWorkflow="
                + intPkProcessInWorkflow + "&intPkProduct=" + intPkProduct);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                FinalCostDataModel jobProcessFinalCost = new FinalCostDataModel();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jobProcessFinalCost = JsonSerializer
                        .Deserialize<FinalCostDataModel>(jsonResponseModel.objResponse.ToString());

                    await subWorkInProgressStatus();
                    ViewBag.intJobId = intJobId;
                    ViewBag.intPkProcessInWorkflow = intPkProcessInWorkflow;
                    aresult = PartialView("CostModalPartialView", jobProcessFinalCost);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessFinalCostLog(
            int intPkFinal, String strCalculationType, bool boolIsBase, String strJsonCurrentObj)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetProcessFinalCostLog?intPkFinal=" + intPkFinal);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<FinalCostLogModel>>(jsonResponseModel.objResponse.ToString());
                    //ViewBag.strJsonCurrentObj = JsonSerializer.Deserialize<>(strJsonCurrentObj);

                    ViewBag.strCalculationType = strCalculationType;
                    ViewBag.boolIsBase = boolIsBase;
                    aresult = PartialView("FinalCostLogPartialView", jsonResponseModel.objResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetPriceLog
            (
            int intJobId,
            double numPrice,
            int intPkWorkflow,
            int? intnEstimationId,
            int? intnCopyNumber
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                $"/Job/GetPriceLog?intJobId={intJobId}&intPkWorkflow={intPkWorkflow}&intnEstimateId={intnEstimationId}" +
                $"&intnCopyNumber={intnCopyNumber}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                List<JobDueDateAndPriceLogModel> darrJobDueDateAndPriceLog = new List<JobDueDateAndPriceLogModel>();
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrJobDueDateAndPriceLog = JsonSerializer
                        .Deserialize<List<JobDueDateAndPriceLogModel>>(jsonResponseModel.objResponse.ToString());

                    ViewBag.numPrice = numPrice;
                    ViewBag.intJobId = intJobId;
                    ViewBag.boolIsPrice = true;
                    ViewBag.intPkWorkflow = intPkWorkflow;
                    ViewBag.intnEstimationId = intnEstimationId;
                    ViewBag.intnCopyNumber = intnCopyNumber;
                    aresult = PartialView("JobPriceAndDueDateModalPartialView", darrJobDueDateAndPriceLog);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetDueDateLog(int intJobId, String strDueDate)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                $"/Job/GetDueDateLog?intJobId={intJobId}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);
                List<JobDueDateAndPriceLogModel> darrJobDueDateAndPriceLog = new List<JobDueDateAndPriceLogModel>();
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrJobDueDateAndPriceLog = JsonSerializer
                        .Deserialize<List<JobDueDateAndPriceLogModel>>(jsonResponseModel.objResponse.ToString());

                    ViewBag.strDueDate = strDueDate;
                    ViewBag.intJobId = intJobId;
                    ViewBag.boolIsPrice = false;
                    aresult = PartialView("JobPriceAndDueDateModalPartialView", darrJobDueDateAndPriceLog);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> ConfirmResourceAutomaticallySet(
            SetResourceOnWorkflowModel setResourceOnWorkflowModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(setResourceOnWorkflowModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/ConfirmResourceAutomaticallySet", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetProcessInputs(
            int intPkProcessInWorkflow,
            int? intnPkResource,
            int? intnJobId,
            int intPkeleetOrEleele,
            bool boolIsEteel)
        {
            List<WorkflowProcessInputModel> darrproinp = await subGetProcessInputs(intPkProcessInWorkflow,
                intnPkResource, intnJobId, intPkeleetOrEleele, boolIsEteel, true);
            return base.Ok(darrproinp);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetResourceWaste(
            int intPkProcessInWorkflow_I,
            int intPkEleetOrEleele_I,
            bool boolIsEleet_I
            )
        {
            object obj = null;
            if (
                JobsController.jobwfmodel != null
                )
            {
                List<ResourceOrTemplateModel> darrresortemIO = JobsController.jobwfmodel.arrpro.FirstOrDefault(piw =>
                piw.intPkProcessInWorkflow == intPkProcessInWorkflow_I).arrresortypInput;

                darrresortemIO.AddRange(JobsController.jobwfmodel.arrpro.FirstOrDefault(piw =>
                piw.intPkProcessInWorkflow == intPkProcessInWorkflow_I).arrresortypOutput);

                ResourceOrTemplateModel io = darrresortemIO.FirstOrDefault(io =>
                io.intPkEleetOrEleele == intPkEleetOrEleele_I && io.boolIsEleet == boolIsEleet_I);

                List<WasteModel> darrwstmodel = io.arrwstWaste;

                List<WasteAdditionalModel> darrwstaddmodel = io.arrwstaddWasteAdditional;

                String strResource = (io.strResource != null) ? io.strResource : "";

                obj = new
                {
                    strResource = strResource,
                    darrwstmodel = darrwstmodel,
                    darrwstaddmodel = darrwstaddmodel
                };
            }

            return base.Ok(obj);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DownloadTicket(int intJobId, int intPkWorkflow)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/Get?intJobId=" + intJobId + "&intPkWorkflow=" + intPkWorkflow);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "", false,
                null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                //jsonResponse.objResponse = "{\"intJobId\":5519144,\"strJobTicket\":\"BrochuresLili\",\"intProductKey\":271930,\"strProductName\":\"Brochures\",\"strProductCategory\":\"Brochures\",\"strJobStatus\":\"Pending\",\"strDeliveryDate\":\"2020-09-09\",\"strDeliveryTime\":\"13:43:23\",\"strDueDate\":\"2020-09-09\",\"strDueTime\":\"13:43:23\",\"strStartDate\":\"2020-09-09\",\"strStartTime\":\"13:43:23\",\"strEndDate\":\"2020-09-09\",\"strEndTime\":\"13:43:23\",\"intnQuantity\":100,\"arrattr\":[{\"intAttributeId\":39334664,\"strAttributeName\":\"Size\",\"strValue\":\"8.5 in. x 11 in.\"},{\"intAttributeId\":39334665,\"strAttributeName\":\"Color Options\",\"strValue\":\"Full-Color Front - Unprinted Back\"},{\"intAttributeId\":39334666,\"strAttributeName\":\"Paper Choices\",\"strValue\":\"Bond\"},{\"intAttributeId\":39334667,\"strAttributeName\":\"Folding Options\",\"strValue\":\"No Fold\"},{\"intAttributeId\":39334668,\"strAttributeName\":\"Shrink Wrapping\",\"strValue\":\"None\"},{\"intAttributeId\":39334669,\"strAttributeName\":\"Turnaround Times\",\"strValue\":\"Economy\"},{\"intAttributeId\":39334670,\"strAttributeName\":\"Job Name\",\"strValue\":\"BrochuresLili\"},{\"intAttributeId\":39334671,\"strAttributeName\":\"Comments\",\"strValue\":\"\"}],\"strCustomerName\":\"Ivan\",\"strCompany\":\"Company Name\",\"strBranch\":\"ADC\",\"strAddressLine1\":\"Wall Street #3\",\"strAddressLine2\":\"Wall Street build 201 #52\",\"strCity\":\"Houston\",\"strState\":\"Texas\",\"strPostalCode\":\"152463\",\"strCountry\":\"United States\",\"strEmail\":\"ivancito@gmail.com\",\"strPhone\":\"55555555\",\"strCustomerRep\":\"Rosalba\",\"strSalesRep\":\"Inaki\",\"strDelivery\":\"Some Place\",\"strWorkflowName\":\"Brochure-Offset\",\"arrcal\":[{\"strDescription\":\"CalProduct1\",\"numCost\":40}],\"arrpro\":[{\"strName\":\"Cut Parent to Run Size\",\"arrcal\":[{\"strDescription\":\"Proceso1\",\"numCost\":40}],\"arrres\":[{\"strName\":\"Generic Offset Paper 19x25\",\"numQuantity\":0,\"strUnit\":\"Cm\",\"numCost\":0,\"strEmployee\":\"Ivancito\"}]}],\"numnJobCost\":100,\"numnJobPrice\":100}";

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer
                    .Deserialize<TicketModel>(jsonResponse.objResponse.ToString());

                    TicpdfTicketPdf ticpdf = new TicpdfTicketPdf((TicketModel)jsonResponse.objResponse);

                    aresult = base.Ok(Convert.ToBase64String(new MemoryStream(ticpdf.arrbyteGenerateTicket()).ToArray()));
                }
                else
                {
                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetJobWorkflowInformation(int intjobId, int intPkWorkflow)
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Workflow/GetJobWorkflowInformation?intjobId={intjobId}&intPkWorkflow={intPkWorkflow}");

            JsonResponseModel jsonResponseModel = new JsonResponseModel();

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                            .Deserialize<NeededResourcesAndUnlinkModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetJobMovements(
            int intJobId
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Accounting/GetJobMovements?intjobId={intJobId}");

            JsonResponseModel jsonResponseModel = new JsonResponseModel();

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<JobMovementsModel>(jsonResponseModel.objResponse.ToString());
            }

            return PartialView("JobMovementsPartialView", jsonResponseModel);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetJobFilesUrl(
            int intJobId
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/GetFilesUrl?intjobId={intJobId}");

            JsonResponseModel jsonResponseModel = new JsonResponseModel();

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponseModel.intStatus == 200)
                {
                    jsonResponseModel.objResponse = JsonSerializer
                            .Deserialize<List<JobFilesModel>>(jsonResponseModel.objResponse.ToString());

                    aresult = PartialView("JobFilesPartialView", jsonResponseModel.objResponse);
                }
            }

            return aresult;
        }
        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Tasks()
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                boolnPending = true
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/GetPrintshopJobs?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            String strResult = null;
            List<JobsModel> darrjobs = new List<JobsModel>();
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                strResult = await response.Content.ReadAsStringAsync();

                //                                          //Deserialize the response.
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    //                                      //Deserialize the objResponse;
                    darrjobs = JsonSerializer.Deserialize<List<JobsModel>>(jsonResponseModel.objResponse.ToString());
                    aresult = View("Tasks", darrjobs);
                    ViewBag.boolPending = true;
                }
            }

            return aresult;
        }
        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTasksJobs(
            bool boolPending
            )
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            bool? boolnPending = null;
            bool? boolnInProgress = null;
            if (
                boolPending
                )
            {
                boolnPending = true;
            }
            else
            {
                boolnInProgress = true;
            }

            Object obj = new
            {
                boolnPending = boolnPending,
                boolnInProgress = boolnInProgress
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/GetPrintshopJobs?{obj}"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            String strResult = null;
            List<JobsModel> darrjobs = new List<JobsModel>();
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                strResult = await response.Content.ReadAsStringAsync();

                //                                          //Deserialize the response.
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    //                                      //Deserialize the objResponse;
                    darrjobs = JsonSerializer.Deserialize<List<JobsModel>>(jsonResponseModel.objResponse.ToString());
                    aresult = PartialView("TaskPartialView", darrjobs);
                    ViewBag.boolPending = boolPending;
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetPeriodsForAJobAndWorkflow(
            int intJobId,
            int intPkWorkflow
            )
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                $"/Job/GetPeriodsForAJobAndWorkflow?intJobId={intJobId}&intPkWorkflow={intPkWorkflow}");

            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                String strResult = await response.Content.ReadAsStringAsync();

                //                                          //Deserialize the response.
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                PeriodsForJobAndWorkflowModel perforjob = new PeriodsForJobAndWorkflowModel();
                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    //                                      //Deserialize the objResponse;
                    perforjob = JsonSerializer.Deserialize<PeriodsForJobAndWorkflowModel>(
                        jsonResponseModel.objResponse.ToString());
                }
                aresult = PartialView("JobPeriodsPartialView", perforjob);

                ViewBag.responseTasks = jsonResponseModel;
                ViewBag.intJobId = intJobId;
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> UpdateWorkInProgressStatus(
            WorkInProgressStatusModel workInProgressStatus 
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(workInProgressStatus),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/UpdateWorkInProgressStatus", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SendEmailToCustomer(
            int intJobId,
            int[] arrintOrdersId
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new { 
                intJobId = intJobId,
                arrintOrdersId = arrintOrdersId
            }), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/SendEmailToCustomer", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGeJobtWorkflowProcess(int intJobId_I, int intPkWorkflow_I)
        {
            String result = null;
            JsonResponseModel jsonResponse = new JsonResponseModel();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/GetForAJob?intJobId=" + intJobId_I + "&intPkWorkflow=" + intPkWorkflow_I);

            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                result = await response.Content.ReadAsStringAsync();

                //                                          //Deserializae the response.
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                bool boolIsJobWorkflowModel = jsonResponse.objResponse == null;
                if (
                    boolIsJobWorkflowModel
                    )
                {
                    jsonResponse.objResponse = "";
                }
                else
                {
                    jsonResponse.objResponse = JsonSerializer
                            .Deserialize<JobWorkflowModel>(jsonResponse.objResponse.ToString());
                }
                JobsController.jobwfmodel = boolIsJobWorkflowModel ? null : (JobWorkflowModel)jsonResponse.objResponse;
            }

            ViewBag.objectJobWorkflow = jsonResponse;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<WorkflowProcessInputModel>> subGetProcessInputs(
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
        private async Task subWorkInProgressStatus()
        {
            List<String> darrstrWorkInProgressStatus = new List<String>();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/WorkInProgressStatus");

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
                    darrstrWorkInProgressStatus = JsonSerializer
                        .Deserialize<List<String>>(jsonResponseModel.objResponse.ToString());
                }
            }

            ViewBag.darrstrWorkInProgressStatus = darrstrWorkInProgressStatus;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
