/*RP. TASK ESTIMATE*/
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Estimate;
using Odyssey2Frontend.Models;
using System.Text;
using Google.Protobuf;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Mvc.Rendering;
//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: July 3, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class EstimateController : BaseController
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public EstimateController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.
        public async Task<IActionResult> Index(
                bool boolRequested,
                bool boolWaitingForCustResponse,
                bool boolRejected
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            String strResult = null;

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetPrintshopEstimates?boolRequested=" + boolRequested
                + "&boolWaitingForCustResponse=" + boolWaitingForCustResponse
                + "&boolRejected=" + boolRejected);

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

            ViewBag.boolRequested = boolRequested;
            ViewBag.boolWaitingForCustResponse = boolWaitingForCustResponse;
            ViewBag.boolRejected = boolRejected;
            return View(darrjobs);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEstimates(
            int intJobId,
            int intPkWorkflow,
            int intPkProduct,
            bool boolReadOnly
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");
            ViewBag.intJobId = intJobId;
            ViewBag.intPkWorkflow = intPkWorkflow;
            ViewBag.intPkProduct = intPkProduct;
            ViewBag.boolReadOnly = boolReadOnly;

            JsonResponseModel jsonResponse = await jsonrespGetEstimationIds(intJobId, intPkWorkflow);

            if (
                (jsonResponse.intStatus == 200) && 
                (jsonResponse.objResponse != null) &&
                (((EstimationIntIdModel)jsonResponse.objResponse).intPkProduct > 0)
                )
            {
                ViewBag.intPkProduct = ((EstimationIntIdModel)jsonResponse.objResponse).intPkProduct;
            }

            ViewBag.boolFromScratch = false;
            aresult = View(jsonResponse);

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEstimationIds(
            int intJobId,
            int intPkWorkflow
            )
        {
            IActionResult aresult = base.Ok(await jsonrespGetEstimationIds(intJobId, intPkWorkflow));

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetBudgetEstimation
            (
            int intJobId,
            int intPkWorkflow,
            int? intnPkEstimation,
            String strBaseDate,
            String strBaseTime,
            int? intnCopyNumber,
            bool boolIsConfirmed,
            bool boolIsFromJob
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            JsonResponseModel jsonResponse = await this.estModGetBudgetEstimation(intJobId,
            intPkWorkflow, intnPkEstimation, strBaseDate, strBaseTime, intnCopyNumber);

            aresult = base.Ok(jsonResponse);

            if (jsonResponse.intStatus == 200)
            {
                jsonResponse.objResponse = JsonSerializer
                    .Deserialize<EstimateModel>(jsonResponse.objResponse.ToString());

                ViewBag.strUserMessage = jsonResponse.strUserMessage;
                ViewBag.intnPkEstimation = intnPkEstimation;
                ViewBag.boolIsConfirmed = boolIsConfirmed;
                ViewBag.intnCopyNumber = intnCopyNumber;
                ViewBag.boolIsFromJob = boolIsFromJob;

                aresult = PartialView("EstimationPartialView", jsonResponse.objResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOptions(EstimateOptionsModel estimateOptions)
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (estimateOptions.arrresSelected.Count == 0)
            {
                estimateOptions.arrresSelected = null;
            }

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/GetOptions?{estimateOptions}"),
                Content = new StringContent(JsonSerializer.Serialize(estimateOptions),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponseModel);
                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<EstimateOptionsModel>(jsonResponseModel.objResponse.ToString());

                    ViewBag.intEstimationId = estimateOptions.intId;
                    ViewBag.intJobId = estimateOptions.intJobId;
                    ViewBag.intPkWorkflow = estimateOptions.intPkWorkflow;

                    aresult = PartialView("EstimateOptionsPartialView", jsonResponseModel.objResponse);
                }
            }

            return aresult;
            //HttpResponseMessage response = await client.SendAsync(request);

            //aresult = PartialView("EstimateOptionsPartialView");
            //return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> EstimatesAreAddable(String estimationAdd)
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/EstimatesAreAddable"),
                Content = new StringContent(estimationAdd,
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponseModel);
                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = ((JsonElement)jsonResponseModel.objResponse).GetBoolean();

                    aresult = base.Ok(jsonResponseModel);
                }
            }

            return aresult;
            //HttpResponseMessage response = await client.SendAsync(request);

            //aresult = PartialView("EstimateOptionsPartialView");
            //return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddEstimation(String estimationAdd)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(estimationAdd,
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/AddEstimates", content);

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
        public async Task<IActionResult> ConfirmResources(String confirmResources)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(confirmResources,
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/ConfirmResources", content);

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
        public async Task<IActionResult> Download(int intJobId, int intPkWorkflow)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetEstimations?intJobId=" + intJobId + "&intPkWorkflow=" + intPkWorkflow);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "", false,
                null, null);
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
                    .Deserialize<List<EstimateModel>>(jsonResponse.objResponse.ToString());

                    EstpdfEstimatePdf estpdf = new EstpdfEstimatePdf((List<EstimateModel>)jsonResponse.objResponse);

                    aresult = new FileStreamResult(new MemoryStream(estpdf.arrbyteGenerateEstimate()), "application/pdf")
                    {
                        FileDownloadName = "Estimate.pdf"
                    };
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetResourcesFromIoGroup
            (
            int intJobId,
            int intPkProcessInWorkflow,
            int intPkEleetOrEleele,
            bool boolIsEleet
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/GetResourcesFromIoGroup?intJobId={intJobId}&" +
                $"intPkProcessInWorkflow={intPkProcessInWorkflow}&" +
                $"intPkEleetOrEleele={intPkEleetOrEleele}&boolIsEleet={boolIsEleet}");

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse =
                    JsonSerializer.Deserialize<List<EstimateResourcesModel>>(jsonResponse.objResponse.ToString());
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> RenameEstimation(
            EstimationUpdateModel estimationUpdateModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(estimationUpdateModel),
                Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/RenameEstimation", content);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "",
                false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
            }

            aresult = base.Ok(jsonResponse);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> EstimateToOrder(
            ConvertToOrderModel convertToOrderModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(convertToOrderModel),
                Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/EstimateToOrder", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> EstimateToRejected(
            int intJobId,
            bool boolSendEmail
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new { 
                intJobId = intJobId,
                boolSendEmail = boolSendEmail
            }), Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/EstimateToRejected", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetJobAsPending(
            ConvertToOrderModel convertToOrderModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(convertToOrderModel),
                Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/SetJobAsPending", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> CopyConfirmedEstimate
            (
            int intJobId,
            int intPkWorkflow
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new
            {
                intJobId = intJobId,
                intPkWorkflow = intPkWorkflow
            }), Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/CopyConfirmedEstimate", content);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetQuantityForEstimate(
            SetEstimateQuantityModel setEstimateQuantityModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(setEstimateQuantityModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/SetQuantityForEstimate", content);

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
        public async Task<IActionResult> GetEstimationsDetails(
            int intJobId,
            int intPkWorkflow
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/GetEstimationsDetails?intJobId={intJobId}&intPkWorkflow={intPkWorkflow}");

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    List<EstimatesSummaryModel> darrestimatesSummary = JsonSerializer
                        .Deserialize<List<EstimatesSummaryModel>>(jsonResponseModel.objResponse.ToString());

                    aresult = PartialView(darrestimatesSummary);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SendEstimatesPrices(
            SendEstimateModel sendEstimateModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(sendEstimateModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/SendEstimatesPrices", content);

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
        public async Task<IActionResult> SendJobPrice(
            SendEstimateModel sendEstimateModel
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(sendEstimateModel),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/SendJobPrice", content);

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
        public async Task<IActionResult> GetWorkflow(
            int intJobId
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetEstimateWorkflow?intJobId=" + intJobId);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    await subGetPrintshopProcess();
                    await subGetProcessGroups();
                    jsonResponse.objResponse = JsonSerializer.Deserialize<JobWorkflowJobModel>(jsonResponse.objResponse
                        .ToString());

                    ViewBag.intJobId = intJobId;
                    ViewBag.boolFromScratch = true;
                    ViewBag.intnPkProduct = ((JobWorkflowJobModel)jsonResponse.objResponse).intPkProduct;
                }

                aresult = View("Workflow", jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateNewEstimate(
            String strName,
            int intContactId,
            int intQuantity,
            bool boolSendEmail
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new
            {
                strName = strName,
                intContactId = intContactId,
                intQuantity = intQuantity,
                boolSendEmail = boolSendEmail
            }), Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/CreateNewEstimate", content);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "",
                false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<int>(jsonResponse.objResponse.ToString());
                }
            }

            aresult = base.Ok(jsonResponse);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetResourceEstimate(
            AddResourceOnWorkflowModel addresonwkfl
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(addresonwkfl),
                Encoding.UTF8, "application/json");

            String result = null;
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Job/SetResourceEstimate", content);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "",
                false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
            }

            aresult = base.Ok(jsonResponse);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAllCustomers()
        {
            IActionResult aresult = base.BadRequest("Something wrong.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/customer/GetAllForAPrintshop");

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<List<PrintshopCustomerModel>>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<JsonResponseModel> estModGetBudgetEstimation(
            int intJobId,
            int intPkWorkflow,
            int? intnPkEstimation,
            String strBaseDate,
            String strBaseTime,
            int? intnCopyNumber
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetBudgetEstimation?intJobId=" + intJobId +
                "&intPkWorkflow=" + intPkWorkflow +
                "&intnEstimationId=" + intnPkEstimation +
                "&strBaseDate=" + strBaseDate +
                "&strBaseTime=" + strBaseTime +
                "&intnCopyNumber=" + intnCopyNumber
                );

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "", false,
                null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
            }

            return jsonResponse;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public async Task subGetPrintshopProcess()
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

            ViewBag.selectListProcessType = selectListProcessType;
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

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<JsonResponseModel> jsonrespGetEstimationIds(
            int intJobId,
            int intPkWorkflow
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetEstimationsIds?intJobId=" + intJobId + "&intPkWorkflow=" + intPkWorkflow);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "", false,
                null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<EstimationIntIdModel>(jsonResponse.objResponse.ToString());
                }
            }

            return jsonResponse;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
