/*TASK RP. RESOURCES*/
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

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December 19, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopResourcesTemplateController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/

        static List<PrintshopProcessTemplateModel> darrstrProcessTemplate { get; set; }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public PrintshopResourcesTemplateController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            List<ResourceModel> darrresource = new List<ResourceModel>();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (
                //                                          //If the printshopId is not null.
                !String.IsNullOrEmpty(this.strPrintshopId)
                )
            {
                HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Type/GetPrintshopTypes?strPrintshopId={ this.strPrintshopId }" +
                    $"&strResOrPro=Resource&boolnIsPhysical=true");

                String strResult;
                if (response.IsSuccessStatusCode)
                {
                    strResult = await response.Content.ReadAsStringAsync();

                    JsonResponseModel JsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                    JsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<ResourceModel>>(JsonResponseModel.objResponse.ToString());

                    if (JsonResponseModel.intStatus == 200)
                    {
                        darrresource = (List<ResourceModel>)JsonResponseModel.objResponse;
                    }
                }
            }

            ViewBag.strPrintshopId = this.strPrintshopId;
            return View(darrresource);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddXJDF(bool boolIsPhysical)
        {
            List<PrintshopProcessTemplateModel> darrXJDFProcess = await subGetPrintshopXJDFProcess();
            ViewBag.darrXJDFProcess = new SelectList(darrXJDFProcess.Select(
                    s => new PrintshopProcessTemplateModel
                    {
                        intPk = s.intPk,
                        strTypeId = s.strTypeId
                    }
                ),
                "intPk", "strTypeId");

            if(
                boolIsPhysical
                )
            {
                await subGetResourcesClassification();
            }

            await GetResourcesByProcessOrAll("All", "All", boolIsPhysical);

            ViewBag.strPrintshopId = this.strPrintshopId;
            ViewBag.boolIsPhysical = boolIsPhysical;

            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetResourcesByProcessOrAll(
            String strProcess, 
            String strClasification, 
            bool boolIsPhysical)
        {
            IActionResult aresult;

            if(strClasification == null)
            {
                strClasification = "Parameter";
            }

            if (strProcess == "All")
            {
                List<ResourceModel> darrXJDFResource = new List<ResourceModel>();
                darrXJDFResource = await subGetPrintshopXJDFResources(boolIsPhysical);
                if (strClasification != "All")
                {
                    darrXJDFResource = darrXJDFResource.Where(w => w.strClassification == strClasification).ToList();
                }
                ViewBag.darrXJDFResource = darrXJDFResource;
                aresult = base.Ok(darrXJDFResource);
            }
            else
            {
                ResourceModel XJDFResource = new ResourceModel();
                XJDFResource = await subGetPrintshopXJDFResourcesByProcess(Convert.ToInt32(strProcess), boolIsPhysical);

                List<ResourcesByProcessModel> resXJDFResourceList = XJDFResource.arrres;
                if (strClasification != "All")
                {
                    resXJDFResourceList = resXJDFResourceList.Where(w => w.strClassification == strClasification).ToList();
                }
                aresult = base.Ok(resXJDFResourceList);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetAscendantsValuesResource(int intPkType)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            List<MyResourcesModel> darrmyResourcesModel = await subGetResources(intPkType);

            ViewBag.intPkTemplate = intPkType;

            aresult = PartialView("GetAscendantsValuesResourcePartialView", darrmyResourcesModel);

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetTemplatesAndResources(int intPk, bool boolIsType)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            ObjTemplatesAndResourcesResponse templatesAndResources = new ObjTemplatesAndResourcesResponse();

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/resource/GetAttributesTemplatesAndresources?intPk={intPk}&boolIsType={boolIsType}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                templatesAndResources = JsonSerializer
                        .Deserialize<ObjTemplatesAndResourcesResponse>(strResult);

                if (
                    templatesAndResources.intStatus == 200
                    )
                {
                    aresult = View("GetTemplatesAndResources", templatesAndResources);
                }
                else { 
                    aresult = RedirectToAction("index");
                }
            }

            ViewBag.boolDefaultCalculationResource = true;
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddXJDFForm(int intPkType, String strType,
            int intPkResource, int intnPkTemplate, bool boolIsPhysical, bool? boolnIsChangeable, 
            bool? boolIsDeviceToolOrCustom)
        {
            List<TemplateModel> darrTemplates = await subGetTemplates(intPkType);
            List<MyResourcesModel> darrmyResources = await subGetResources(intPkType);
            EditResourceModel jsonResponseModel = new EditResourceModel();
            jsonResponseModel.intPkType = intPkType;
            jsonResponseModel.strTypeName = strType;
            jsonResponseModel.intPkResource = intPkResource;
            jsonResponseModel.intnPkInherited = intnPkTemplate > 0 ? intnPkTemplate : 0;
            jsonResponseModel.boolIsPhysical = boolIsPhysical;
            jsonResponseModel.boolnIsChangeable = boolnIsChangeable;
            jsonResponseModel.boolnIsDeviceToolOrCustom = boolIsDeviceToolOrCustom;

            ViewBag.darrTemplates = new SelectList(
                    darrTemplates.Select(s => new SelectListItem
                    {
                        Text = s.strTypeId,
                        Value = s.intPk.ToString()
                    }),
                    "Value",
                    "Text",
                    jsonResponseModel.intnPkInherited
                    );

            ViewBag.darrTemplatesForInherit = new SelectList(
                    darrTemplates.Select(s => new SelectListItem
                    {
                        Text = s.strTypeId,
                        Value = s.intPk.ToString()
                    }),
                    "Value",
                    "Text"
                    );

            ViewBag.darrmyResources = new SelectList(
                    darrmyResources.Select(s => new SelectListItem
                    {
                        Text = s.strName,
                        Value = s.intPk.ToString()
                    }),
                    "Value",
                    "Text"
                    );

            return View("AddXJDFForm", jsonResponseModel);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAttributesAndValues(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/GetAttributesAndValues?intPk={ intPk }");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                List<MyResourcesModel> darrmyResourcesModel = JsonSerializer
                    .Deserialize<List<MyResourcesModel>>(strResult);

                aresult = base.Ok(darrmyResourcesModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAscendantsPkAndValue(int intResourcePk, int intAttributePk)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/GetAscendantsPkAndValue?intResourcePk={intResourcePk}" +
                    $"&intAttributePk={intAttributePk}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                MyResourcesModel myResourcesModel = JsonSerializer
                    .Deserialize<MyResourcesModel>(strResult);

                aresult = base.Ok(myResourcesModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetValue(int intValuePk, bool boolIsCost, 
            bool boolIsAvailability, bool boolIsUnit)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Attribute/GetValue?intValuePk={intValuePk}&" +
                    $"boolIsCost={boolIsCost}&boolIsUnit={boolIsUnit}&boolIsAvailability={boolIsAvailability}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    ) 
                {
                    jsonResponseModel.objResponse = JsonSerializer
                            .Deserialize<InheritanceModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }


        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> IsAddable(
            ResourceIsAddableModel resaddableModel
            )
        {
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/IsAddable"),
                Content = new StringContent(JsonSerializer.Serialize(resaddableModel),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetBoolean();
                }
                aresult = Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Add(MyResourcesModel myResources)
        {
            myResources.strPrintshopId = this.strPrintshopId;
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(myResources),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/Add", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer
                            .Deserialize<MyResourcesModel>(jsonResponse.objResponse.ToString());
                }
                aresult = Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Edit(MyResourcesModel myResources)
        {
            myResources.strPrintshopId = this.strPrintshopId;
            myResources.strUnit = myResources.strUnit ?? "";
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(myResources),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/Edit", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.intStatus == 200
                    ) 
                {
                    jsonResponse.objResponse = JsonSerializer
                            .Deserialize<MyResourcesModel>(jsonResponse.objResponse.ToString());
                }

                aresult = Ok(jsonResponse);
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
                    + $"/Resource/IsDispensable?intPk={intPk}");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                ObjIsDispensableResponse objTemplatesAndResourcesResponse = JsonSerializer.
                    Deserialize<ObjIsDispensableResponse>(strResult);

                aresult = base.Ok(objTemplatesAndResourcesResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Delete(int intPk)
        {
            var resourcePk = new { intPk = intPk };
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resourcePk),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/Delete", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                ObjTemplatesAndResourcesResponse objTemplatesAndResourcesResponse = JsonSerializer
                    .Deserialize<ObjTemplatesAndResourcesResponse>(strResult);

                aresult = Ok(objTemplatesAndResourcesResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> AddCustomResourceTemplate()
        {
            return PartialView("AddCustomResourceTemplatePartialView");
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult> AddCustomResource(CustomResource customResource)
        {
            ActionResult aresult = BadRequest("Invalid data");
            customResource.strPrintshopId = this.strPrintshopId;

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(customResource),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/Resource/AddCustom", content);

            String strddd = await response.Content.ReadAsStringAsync();

            aresult = BadRequest();
            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetData(int intPk)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/GetData?intPk={intPk}");

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<EditResourceModel>(jsonResponseModel.objResponse.ToString());

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetPrintshopTypes(bool boolIsPhysical)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            List<ResourceModel> darrresource = new List<ResourceModel>();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Type/GetPrintshopTypes?strPrintshopId={ this.strPrintshopId }" +
                $"&strResOrPro=Resource&boolnIsPhysical={boolIsPhysical}");

            String strResult;
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel JsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (JsonResponseModel.intStatus == 200)
                {
                    darrresource = JsonSerializer.Deserialize<List<ResourceModel>>(JsonResponseModel.objResponse.ToString());
                    aresult = PartialView("ResourceTypesPartialView", darrresource);
                }
                else
                {
                    aresult = base.Ok(JsonResponseModel);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetUnitsMeasurement()
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + $"/Resource/GetUnitsMeasurement");

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel JsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (JsonResponseModel.intStatus == 200)
                {
                    JsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<String>>(JsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(JsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetCostData(int intPkResource)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + 
                $"/Resource/GetCostData?intPkResource=" + intPkResource);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponseModel.intStatus == 200)
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<CostModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //[HttpPost]
        public async Task<IActionResult> AddCost(CostModel cost)
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(cost),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/AddCost", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Availability(
            ResourceAvailability resourceAvailability
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resourceAvailability),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/Availability", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTimes(
            int intPkResource
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Resource/GetTimes?intPkResource=" + intPkResource);

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<ResourceTimeModel>>(jsonResponseModel.objResponse.ToString());
                }

                aresult = PartialView("ResourceTimeTablePartialView", jsonResponseModel.objResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetThicknessUnits(
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Resource/GetThicknessUnits");

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
                    jsonResponseModel.objResponse = JsonSerializer.Deserialize<List<String>>(jsonResponseModel
                        .objResponse.ToString());

                    aresult = base.Ok(jsonResponseModel.objResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetTimeData(
            int intPkTime
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Resource/GetTimeData?intPkTime=" + intPkTime);

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<ResourceTimeModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddTime(
            ResourceTimeOutModel resourceTimeModel
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resourceTimeModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/AddTime", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> UpdateTime(
            ResourceTimeOutModel resourceTimeModel
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resourceTimeModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Resource/UpdateTime", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> DeleteTime(
            int intPkTime
            )
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(new { intPkTime = intPkTime }),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + "/Resource/DeleteTime", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetInheritanceData(int intPkTemplateOrResource)
        {
            ActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/getinheritancedata?intPkTemplateOrResource={intPkTemplateOrResource}");

            if (response.IsSuccessStatusCode)
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<InheritanceModel>(jsonResponseModel.objResponse.ToString());

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<TemplateModel>> subGetTemplates(int intPkType)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Type/GetTemplates?intPk={ intPkType }");

            List<TemplateModel> darrTemplateModel = new List<TemplateModel>();

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                darrTemplateModel = JsonSerializer
                    .Deserialize<List<TemplateModel>>(strResult);
            }

            return darrTemplateModel;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<MyResourcesModel>> subGetResources(int intPkType)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/GetAscendantsValuesResource?intPkType={ intPkType }");

            List<MyResourcesModel> darrmyResourcesModel = new List<MyResourcesModel>();

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();

                darrmyResourcesModel = JsonSerializer
                    .Deserialize<List<MyResourcesModel>>(strResult);
            }

            return darrmyResourcesModel;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetResourcesClassification()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetResourcesClassification");

            List<String> darrstrProcessTemplate = new List<String>();
            SelectList selectListClasification = null;

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();

                darrstrProcessTemplate = JsonSerializer.Deserialize<List<String>>(result);

                selectListClasification = new SelectList(darrstrProcessTemplate.Where(p => p != "Parameter").Select(
                        s => new
                        {
                            Text = s,
                            Value = s
                        }
                    ),
                    "Text", "Value");
            }

            ViewBag.Clasification = selectListClasification;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<List<ResourceModel>> subGetPrintshopXJDFResources(bool boolIsPhysical)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + "/Type/GetPrintshopXJDFResources");

            String strResult;
            List<ResourceModel> darrXJDFResources = new List<ResourceModel>();

            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrXJDFResources = JsonSerializer.Deserialize<List<ResourceModel>>(jsonResponseModel
                        .objResponse.ToString());

                    darrXJDFResources = darrXJDFResources
                        .Where(w => w.boolIsPhysical == boolIsPhysical).ToList();
                }
            }

            return darrXJDFResources;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task<ResourceModel> subGetPrintshopXJDFResourcesByProcess(int intPkProcess, bool boolIsPhysical)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + "/Type/GetXJDFResourcesByProcess?strPrintshopId=" + this.strPrintshopId +
                    "&intPkProcess=" + intPkProcess + "&boolIsPhysical=" + boolIsPhysical);

            String strResult;
            ResourceModel XJDFResourcesByProcess = new ResourceModel();
            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                XJDFResourcesByProcess = JsonSerializer
                        .Deserialize<ResourceModel>(jsonResponse.objResponse.ToString());
            }

            return XJDFResourcesByProcess;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<PrintshopProcessTemplateModel>> subGetPrintshopXJDFProcess()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopXJDFProcess");

            darrstrProcessTemplate = new List<PrintshopProcessTemplateModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if(
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrstrProcessTemplate = JsonSerializer
                        .Deserialize<List<PrintshopProcessTemplateModel>>(jsonResponseModel.objResponse.ToString());
                }
                
            }

            return darrstrProcessTemplate;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
