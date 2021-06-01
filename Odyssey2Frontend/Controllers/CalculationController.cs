/*TASK RP. CALCULATION*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December 3, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class CalculationController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //STATIC VARIABLES.

        public static JsonElement elements;

        static List<SelectListItem> darrConditions { get; set; }

        static List<IntentAttributeModel> darrAttributes { get; set; }

        static List<string> darrValues { get; set; }

        static List<AttributeModel> darrattrOrderForm { get; set; }

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public CalculationController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> ConditionToApply(
            int intPk,
            bool boolIsLink,
            bool boolSetCondition
            )
        {
            ViewBag.boolIsLink = boolIsLink;
            ViewBag.boolSetCondition = boolSetCondition;
            //darrattrOrderForm = await subGetAttributes(intPk);
            String strResult = null;
            //JsonResponseModel jsonResponseModel = new JsonResponseModel();
            //jsonResponseModel.objResponse = JsonSerializer
            //        .Deserialize<GroupConditionModel>(strResult);

            ViewBag.ConditionObject = strResult;

            List<ConditionsModel> darrConditions = await GetConditionList();
            SelectList selectList = new SelectList(darrConditions.Select(s => new SelectListItem
            {
                Text = s.strCondition,
                Value = s.intId.ToString()
            }), "Value", "Text");

            return PartialView(selectList);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<List<ConditionsModel>> GetConditionList()
        {
            List<ConditionsModel> darrConditions = new List<ConditionsModel>()
           {
               new ConditionsModel { intId = 0, strCondition = "Pick one"},
               new ConditionsModel { intId = 1, strCondition = "ATTRIBUTE == VALUE"},
               new ConditionsModel { intId = 2, strCondition = "ATTRIBUTE != VALUE"},
               new ConditionsModel { intId = 3, strCondition = "~ AND ~"},
               new ConditionsModel { intId = 4, strCondition = "~ OR ~"}
           };

            return darrConditions;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<List<AttributeModel>> GetAttributeList()
        {
            return darrattrOrderForm;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> CostSettings(int intPk, String strTypeId)
        {
            List<CalculationModel> darrcalBase = await darrcalGetBase(intPk);
            List<CalculationModel> darrcalPerQuantity = await darrcalGetPerQuantity(intPk, true);

            ViewBag.intPk = intPk;
            ViewBag.strTypeId = strTypeId;
            ViewBag.darrcalBase = darrcalBase;
            ViewBag.darrcalPerQuantity = darrcalPerQuantity;
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> NewCost(int intPk, String strTypeId)
        {
            ViewBag.intProductPk = intPk;
            ViewBag.strTypeId = strTypeId;
            await subGetAttributesAndValues(intPk);
            ViewBag.selectlistGroup = new SelectList(await GetGroup(intPk), "Value", "Text");
            List<AccountModel> darrAccounts = await darrGetAllAccounts();
            ViewBag.darrselectlistitemOfAccounts = darrAccounts.Select(account => new SelectListItem
            {
                Text = account.strName,
                Value = account.intPk.ToString()
            }).ToList();
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> EditCost(
            int intPk,
            String strTypeId,
            int intPkCost
            )
        {
            ViewBag.intProductPk = intPk;
            ViewBag.strTypeId = strTypeId;
            ViewBag.intPkCost = intPkCost;
            await subGetConditions(intPkCost);
            await subGetAttributesAndValues(intPk);
            List<AccountModel> darrAccounts = await darrGetAllAccounts();
            JsonResponseModel jsonres = await jsonrespGetOneCalculation(intPkCost);
            ViewBag.darrselectlistitemOfAccounts = darrAccounts.Select(account => new SelectListItem
            {
                Text = account.strName,
                Value = account.intPk.ToString()
            }).ToList();
            return View("NewCost", jsonres.objResponse);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> ProfitSettings(int intPk, String strTypeId)
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetProfit?intPkProduct={intPk}");

            List<CalculationModel> darrcal = new List<CalculationModel>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                        //                                  //If the status is Ok (200).
                        jsonResponseModel.intStatus == 200
                        )
                {
                    darrcal = JsonSerializer.Deserialize<List<CalculationModel>>(jsonResponseModel.objResponse
                        .ToString());
                }
            }

            ViewBag.intPk = intPk;
            ViewBag.strTypeId = strTypeId;
            return View(darrcal);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public ActionResult NewProfit(
            int intPk,
            String strTypeId)
        {
            ViewBag.intPk = intPk;
            ViewBag.strTypeId = strTypeId;
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> EditProfit(
            int intPk,
            String strTypeId,
            int intPkProfit
            )
        {
            JsonResponseModel jsonResponseModel = await jsonrespGetOneCalculation(intPkProfit);
            ViewBag.intPk = intPk;
            ViewBag.strTypeId = strTypeId;
            ViewBag.intPkProfit = intPkProfit;
            return View("NewProfit", jsonResponseModel.objResponse);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> AddCalculation(CalculationModel calculation)
        {
            //CalculationController.subModifyBoolConditionAnd(ref calculation);

            ActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(calculation),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Calculation/Add", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> AddProcessTimeCalculation(CalculationModel calculation)
        {
            CalculationController.subModifyBoolConditionAnd(ref calculation);

            ActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(calculation),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Calculation/AddProcessTime",
                content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> ModifyCalculation(CalculationModel calculation)
        {
            CalculationController.subModifyBoolConditionAnd(ref calculation);

            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(calculation),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/Modify", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> ModifyProcessTime(CalculationModel calculation)
        {
            CalculationController.subModifyBoolConditionAnd(ref calculation);

            ActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(calculation),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/ModifyProcessTime", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(JsonSerializer.Serialize(jsonResponseModel));
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> UpdateStatus(
            int intPkCalculation
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new {
                intPkCalculation = intPkCalculation
            }), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/Calculation/UpdateStatus", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private static void subModifyBoolConditionAnd(
            ref CalculationModel calculation_M
            )
        {
            if (
                //                                          //Only one of the conditions comes the boolConditionAnd is 
                //                                          //      true.
                (((calculation_M.strConditionToApply != null) && (calculation_M.strConditionToApply != "")) &&
                ((calculation_M.intnMinAmount == null) && (calculation_M.intnMaxAmount == null))) ||
                (((calculation_M.strConditionToApply == null) || (calculation_M.strConditionToApply == "")) &&
                ((calculation_M.intnMinAmount != null) || (calculation_M.intnMaxAmount != null)))
                )
            {
                calculation_M.boolConditionAnd = true;
            }
            else if (
                //                                          //The two conditions don't come, boolConditionAnd false.
                (((calculation_M.strConditionToApply == null) || (calculation_M.strConditionToApply == "")) &&
                ((calculation_M.intnMinAmount == null) && (calculation_M.intnMaxAmount == null)))
                )
            {
                calculation_M.boolConditionAnd = false;
            }
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<SelectList> GetIntentList()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?&strResOrPro=Intent");


            SelectList selectListTemplates = null;
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
                    List<TemplateModel> darrTemplates = JsonSerializer
                        .Deserialize<List<TemplateModel>>(jsonResponseModel.objResponse.ToString());

                    selectListTemplates = new SelectList(darrTemplates.Select(
                            s => new TemplateModel
                            {
                                intPk = s.intPk,
                                strTypeId = s.strTypeId
                            }
                        ),
                        "intPk", "strTypeId");
                }
            }

            return selectListTemplates;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetInfoList(
                int intPk,
                bool boolIsAttribute
            )
        {
            IActionResult aresult;

            if (boolIsAttribute)
            {
                List<string> darrInfo = await GetValuesList(intPk);
                if (
                    darrInfo.Count > 0
                    )
                {
                    aresult = base.Ok(darrInfo);
                }
                else
                {
                    aresult = base.Ok("undefined");
                }
            }
            else if (
                !boolIsAttribute &&
                intPk != 0
                )
            {
                List<IntentAttributeModel> darrInfo = await GetAttributeList(intPk);
                aresult = base.Ok(darrInfo);
            }
            else
            {
                aresult = base.Ok("finish");
            }


            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<List<IntentAttributeModel>> GetAttributeList(
                int intPk
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetAttributes?intPk=" + intPk);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();

                darrAttributes = JsonSerializer.Deserialize<List<IntentAttributeModel>>(result);
            }

            return darrAttributes;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<List<string>> GetValuesList(
                int intPk
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetValues?intPk=" + intPk);

            if (
            response.IsSuccessStatusCode
            )
            {
                result = await response.Content.ReadAsStringAsync();

                if (result == "")
                {
                    darrValues = null;
                }
                else
                {
                    darrValues = JsonSerializer.Deserialize<List<string>>(result);
                }
            }

            return darrValues;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOrderFormAttribute(
                int intPk,
                String strIntent,
                int id
            )
        {
            var boolIsAttribute = darrAttributes
                .Where(w => w.intPk == intPk)
                .Select(s => s.boolIsAttribute)
                .FirstOrDefault();

            if (boolIsAttribute)
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                String result = null;
                HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + "/Calculation/GetValues?intPk=" + intPk);

                List<string> darrValues = new List<string>();
                SelectList selectListTemplates;

                if (
                response.IsSuccessStatusCode
                )
                {
                    result = await response.Content.ReadAsStringAsync();

                    darrValues = JsonSerializer.Deserialize<List<string>>(result);

                    selectListTemplates = new SelectList(darrValues.Select(
                            s => new
                            {
                                value = s
                            }
                        ),
                        "value", "value");

                    ViewBag.strIntent = strIntent;
                    ViewBag.IntentAttributes = selectListTemplates;
                    ViewBag.Id = id;
                }
            }

            return PartialView("Form");
        }


        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult> subDeleteCalculation(int intPkCalculation)
        {
            ActionResult aresult = BadRequest("Invalid data");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new
            {
                intPk = intPkCalculation
            }), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/Delete", content);

            if (response.IsSuccessStatusCode)
            {
                aresult = Ok();
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetValuesForAnAttribute(int intPkAttribute)
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetValuesForAnAttribute" +
                $"?intPkAttribute=" + intPkAttribute);

            List<SelectListItem> selectListItems = new List<SelectListItem>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    List<AttributeModel> darrvalues = JsonSerializer
                        .Deserialize<List<AttributeModel>>(jsonResponse.objResponse.ToString());

                    jsonResponse.objResponse = selectListItems = darrvalues.Select(value => new SelectListItem()
                    {
                        Value = value.strValue,
                        Text = value.strValue
                    }).OrderByDescending(value => value.Value).ToList();
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetAllCalculations(int? intPkProduct, String strActionName,
            bool? boolnByProcess, bool? boolnByIntent, bool? boolByResource, bool? boolnByProduct,
            String strCalculationType, int? intnPkWorkflow, int? intnJobId, bool? boolnByTime,
            int? intnPkProcessInWorkflow
            )
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/Get{strActionName}?intPkProduct={intPkProduct}&intnPkProduct={intPkProduct}" +
                $"&boolnByIntent={boolnByIntent}&boolnByProcess={boolnByProcess}&boolnByResource={boolByResource}" +
                $"&strCalculationType={strCalculationType}&boolnByProduct={boolnByProduct}&intnJobId={intnJobId}" +
                $"&intnPkWorkflow= {intnPkWorkflow}&intPkWorkflow={intnPkWorkflow}&boolnByTime={boolnByTime}" +
                $"&intnPkProcessInWorkflow={intnPkProcessInWorkflow}");

            List<CalculationModel> darrcalmod = new List<CalculationModel>();
            if (response.IsSuccessStatusCode)
            {
                ViewBag.Type = strActionName;
                ViewBag.boolnByProcess = boolnByProcess;
                ViewBag.boolnByIntent = boolnByIntent;
                ViewBag.boolByResource = boolByResource;
                ViewBag.intnPkProduct = intPkProduct;
                ViewBag.strCalculationType = strCalculationType;
                ViewBag.boolnByTime = boolnByTime;

                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                        //                                  //If the status is Ok (200).
                        jsonResponseModel.intStatus == 200
                        )
                {
                    darrcalmod = JsonSerializer.Deserialize<List<CalculationModel>>(jsonResponseModel.objResponse
                        .ToString());
                }

                /*CASE*/
                if (
                    (boolnByProduct != null && boolnByProduct == true)
                    )
                {
                    aresult = PartialView("CalculationByProductTablePartialView", darrcalmod);
                }
                else if (
                    (boolByResource != null && boolByResource == true)
                    )
                {
                    aresult = PartialView("CalculationByResourceTablePartialView", darrcalmod);
                }
                else if (
                    (boolnByProcess != null && boolnByProcess == true)
                    )
                {
                    aresult = PartialView("CalculationByProcessTablePartialView", darrcalmod);
                }
                else
                {
                    aresult = PartialView("CalculationTablePartialView", darrcalmod);
                }
                /*END-CASE*/
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> Group(CalculationModel calculationModel)
        {
            ActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(calculationModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Calculation/Group", content);

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = await GetGroup(calculationModel.intnPkProduct.GetValueOrDefault());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetOneCalculation(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            aresult = base.Ok(await jsonrespGetOneCalculation(intPk));

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetPerUnitFromThickness(
            int intPkResource,
            int intPkResourceQFrom,
            int intPkWorkflow
            )
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings" +
                ":serviceAddress") + $"/Calculation/GetPerUnitFromThickness?intPkResource=" + intPkResource +
                "&intPkResourceQFrom=" + intPkResourceQFrom + "&intPkWorkflow=" + intPkWorkflow);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer.Deserialize<int>(jsonResponseModel.objResponse.
                    ToString());

                aresult = Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult> Ungroup(int intGroupId, int intPkProduct)
        {
            ActionResult aresult = BadRequest("Invalid data");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new
            {
                intGroupId = intGroupId
            }), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/Ungroup", content);

            if (response.IsSuccessStatusCode)
            {
                aresult = Ok(await GetGroup(intPkProduct));
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetResourceFromResourceType(int? intResourcePk)
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Resource/GetPrintshopResources?strPrintshopId=" + this.strPrintshopId + $"&intnPkType={intResourcePk}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponseModel.intStatus == 200)
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());
                }
                aresult = Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProcessFromProcessType(int intPkProcessType)
        {
            ActionResult aresult = BadRequest("Invalid data.");

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    aresult = base.Ok(jsonResponseModel);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllProcess()
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetPrintshopProcesses?strPrintshopId=" + this.strPrintshopId);

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    aresult = base.Ok(jsonResponseModel);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetTransform(
            TranformationCalculationModel tranformationCalculationModel
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(tranformationCalculationModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(configuration
                .GetValue<String>("Odyssey2Settings:serviceAddress") + $"/Calculation/SetTransform", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer
                        .Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllAccounts()
        {
            IActionResult aresult = base.Ok(await darrGetAllAccounts());

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public async Task subGetConditions(
            int? intnPkCalculation
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            String strResult = null;

            Object obj = new
            {
                intnPkCalculation = intnPkCalculation
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Workflow/GetConditions"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            String strCondition = null;
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
                    jsonResponseModel.intStatus == 200 &&
                    jsonResponseModel.objResponse != null
                    )
                {
                    //                                      /Deserialize the objResponse;
                    strCondition = jsonResponseModel.objResponse.ToString();
                }
            }

            ViewBag.ConditionObject = strCondition;
            ViewBag.boolIsLink = false;
            ViewBag.boolSetCondition = false;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetAttributesAndValues(int? intnPkProduct)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetAttributesAndValues?intPkProduct=" + intnPkProduct);

            List<AttributeModel> darrattr = new List<AttributeModel>();
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrattr = JsonSerializer.Deserialize<List<AttributeModel>>(
                        jsonResponseModel.objResponse.ToString());

                }
            }

            ViewBag.darrattr = darrattr;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<JsonResponseModel> jsonrespGetOneCalculation(
            int intPk
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetOne?intPk=" + intPk);

            JsonResponseModel jsonResponseModel = new JsonResponseModel(400, "Something is wrong.", null, null, false,
                null, false, null, null);
            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                            .Deserialize<CalculationModel>(jsonResponseModel.objResponse.ToString());
                }
            }

            return jsonResponseModel;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public async Task<List<CalculationModel>> darrcalGetBase(
            int intPk
            )
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetBase?intPkProduct={intPk}");

            List<CalculationModel> darrcal = new List<CalculationModel>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                        //                                  //If the status is Ok (200).
                        jsonResponseModel.intStatus == 200
                        )
                {
                    darrcal = JsonSerializer.Deserialize<List<CalculationModel>>(jsonResponseModel.objResponse
                        .ToString());
                }
            }
            return darrcal;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public async Task<List<CalculationModel>> darrcalGetPerQuantity(
            int intPk,
            bool boolnByProduct
            )
        {
            ActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetPerQuantity?intPkProduct={intPk}&boolnByProduct={boolnByProduct}");

            List<CalculationModel> darrcal = new List<CalculationModel>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                        //                                  //If the status is Ok (200).
                        jsonResponseModel.intStatus == 200
                        )
                {
                    darrcal = JsonSerializer.Deserialize<List<CalculationModel>>(jsonResponseModel.objResponse
                        .ToString());
                }
            }

            return darrcal;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetOrderFormsAttributes(int intPkProduct)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Dictionary<int, string> dicattrcal = new Dictionary<int, string>();

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/GetAttributes?intPk=" + intPkProduct);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonElement darrValues = JsonSerializer.Deserialize<JsonElement>(strResult);

                foreach (var value in darrValues.EnumerateArray())
                {
                    dicattrcal.Add(value.GetProperty("intPk").GetInt32(), value.GetProperty("strName").GetString());
                }
            }

            ViewBag.dicattrcal = dicattrcal;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetPrintshopProcessDropDown()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Dictionary<int, List<CalculationModel>> dicattrcal = new Dictionary<int, List<CalculationModel>>();

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Type/GetPrintshopTypes?strResOrPro=" +
                    $"Process");

            SelectList selectListProcessTemplate = null;
            Dictionary<int, string> dictemp = new Dictionary<int, string>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    List<TemplateModel> darrValues = JsonSerializer
                        .Deserialize<List<TemplateModel>>(jsonResponseModel.objResponse.ToString());

                    selectListProcessTemplate = new SelectList(darrValues.Select(template => new SelectListItem
                    {
                        Text = template.strTypeId,
                        Value = template.intPk.ToString()
                    }), "Value", "Text");
                }
            }

            ViewBag.PrintshopProcess = selectListProcessTemplate;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetPrintshopProcess()
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetPrintshopProcesses?strPrintshopId=" + this.strPrintshopId);

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
                    List<PrintshopProcessTemplateModel> darrpriprotemp = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());

                    ViewBag.dictemp = darrpriprotemp
                        .ToDictionary(value => value.intPk, value => value.strElementName);
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetProfit(int inPkProduct)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/GetProfit?intPkProduct={inPkProduct}");

            CalculationModel calculation = null;
            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();

                List<CalculationModel> darrValues = JsonSerializer.Deserialize<List<CalculationModel>>(result);
                calculation = darrValues.FirstOrDefault();
            }

            ViewBag.Profit = calculation;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        [HttpGet]
        public async Task<List<AttributeModel>> subGetAttributes(int intPk)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetAttributesAndValues?intPkProduct=" + intPk);

            List<AttributeModel> darrattr = new List<AttributeModel>();
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrattr = JsonSerializer.Deserialize<List<AttributeModel>>(
                        jsonResponseModel.objResponse.ToString());
                }
            }

            return darrattr;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public async Task subGetResourceType()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?&strResOrPro=Resource&boolnIsPhysical=true");

            Dictionary<int, String> dicres = new Dictionary<int, string>();
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
                    List<ResourceModel> darrstrResourcesTemplate = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());

                    dicres = darrstrResourcesTemplate
                        .ToDictionary(resource => resource.intPk, resource => resource.strTypeId);

                    await subGetResources();
                }
            }

            ViewBag.dicrestype = dicres;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<List<SelectListItem>> GetGroup(int intPkProduct)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetGroup?intPk=" + intPkProduct);

            List<SelectListItem> darrselectlistitemGroup = new List<SelectListItem>();
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();


                List<int> darrstrgroup = JsonSerializer.Deserialize<List<int>>(strResult);

                darrselectlistitemGroup = darrstrgroup.Select(group => new SelectListItem
                {
                    Text = "G" + group.ToString(),
                    Value = group.ToString()
                }).ToList();
            }

            return darrselectlistitemGroup;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetResources()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Resource/GetPrintshopResources?strPrintshopId=" + this.strPrintshopId);

            Dictionary<int, string> dicres = new Dictionary<int, string>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponseModel.intStatus == 200)
                {
                    List<ResourceModel> darrcalmod = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());
                    jsonResponseModel.objResponse = darrcalmod;

                    dicres = darrcalmod.ToDictionary(resource => resource.intPk, resource => resource.strTypeId);
                }
            }

            ViewBag.dicres = dicres;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetPrintshopTypeOfResources()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?strResOrPro=Resource&boolnIsPhysical=null");

            List<SelectListItem> darrselectlistitem = new List<SelectListItem>();
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
                    List<ResourceModel> darrstrResourcesTemplate = JsonSerializer
                        .Deserialize<List<ResourceModel>>(jsonResponseModel.objResponse.ToString());

                    darrselectlistitem = darrstrResourcesTemplate.Select(res => new SelectListItem
                    {
                        Text = res.strTypeId,
                        Value = res.intPk.ToString()
                    }).ToList();
                }
            }

            ViewBag.darrselectlistitem = darrselectlistitem;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<List<AccountModel>> darrGetAllAccounts()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAllAccountsExpenseAvailable");

            List<AccountModel> darrAccounts = new List<AccountModel>();
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
                    darrAccounts = JsonSerializer
                        .Deserialize<List<AccountModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrAccounts;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
