/*TASK RP. PRODUCT TEMPLATE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;
using PdfSharp.Pdf.Filters;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 22, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopProductTemplateController : BaseController
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public PrintshopProductTemplateController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> Index(int? intnOrderType = null)
        {
            ViewBag.boolContainProducts = false;
            List<PrintshopProductTemplateModel> darrstrCustomTemplateId = await GetProducts(intnOrderType);

            if (
                darrstrCustomTemplateId != null && darrstrCustomTemplateId.Count > 0
                )
            {
                ViewBag.boolContainProducts = true;
            }

            //await GetProductTypes();
            ViewBag.darrstrCustomTemplateId = darrstrCustomTemplateId;
            ViewBag.intnOrderType = intnOrderType;

            await GetPrintshopCategories();

            ViewBag.optionList = new List<SelectListItem>
                {
                    new SelectListItem { Text = "All", Value = "null", Selected = intnOrderType == null ? true : false },
                    new SelectListItem { Text = "Public", Value = "1", Selected = intnOrderType == 1 ? true : false },
                    new SelectListItem { Text = "Private", Value = "2", Selected = intnOrderType == 2 ? true : false },
                    new SelectListItem { Text = "Guided", Value = "3", Selected = intnOrderType == 3 ? true : false }
                };

            await darrGetAllAccountsRevenueAvailable();
            return View("Index");
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> CopyWorkflow(
            int intPkProduct,
            int intPkWorkflow,
            bool boolGeneric
            )
        {
            List<PrintshopProductTemplateModel> darrstrCustomTemplateId = await GetProducts(null);
            await GetProcessesInWorkflow(intPkWorkflow);

            List<SelectListItem> darrselectListItem = darrstrCustomTemplateId.Select(prodTemp => new SelectListItem
            {
                Text = prodTemp.strTypeId,
                Value = prodTemp.intPk.ToString()
            }).ToList();

            ViewBag.intPkProduct = intPkProduct;
            ViewBag.intPkWorkflow = intPkWorkflow;
            ViewBag.boolGeneric = boolGeneric;
            return PartialView("CopyWorkflowPartialView", darrselectListItem);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task GetProductTypes()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/ProductType/GetTypes");

            List<String> darrstr = new List<String>();
            IEnumerable<SelectListItem> XJDFProductType = null;
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                darrstr = JsonSerializer.Deserialize<List<String>>(strResult);

                XJDFProductType = darrstr.Select(str => new SelectListItem
                {
                    Text = str,
                    Value = str
                });
            }

            ViewBag.XJDFProductType = XJDFProductType;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPrintshopCategories()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetPrintshopCategories");

            JsonResponseModel jsonResponse = new JsonResponseModel();

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
                        .Deserialize<List<FilterResponseModel>>(jsonResponse.objResponse.ToString());                    

                    ViewBag.darrCatergories = new SelectList((List<FilterResponseModel>)jsonResponse.objResponse,
                        "strCategory", "strCategory");

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPrintshopCompanies()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetPrintshopCompanies");

            JsonResponseModel jsonResponse = new JsonResponseModel();

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
                        .Deserialize<List<FilterResponseModel>>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPrintshopCompanyBranches
            (
                int? intnCompanyId = null
            )
        {

            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetPrintshopCompanyBranches?intnCompanyId=" + intnCompanyId);

            JsonResponseModel jsonResponse = new JsonResponseModel();

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
                        .Deserialize<List<FilterResponseModel>>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCompanyBranchContacts
            (
                int? intCompanyId_I, 
                int? intBranchId_I
            )
        {

            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetCompanyBranchContacts?intnCompanyId=" + intCompanyId_I 
                + "&intnBranchId=" + intBranchId_I);

            JsonResponseModel jsonResponse = new JsonResponseModel();

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
                        .Deserialize<List<FilterResponseModel>>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetAccountToProduct(
            ProductAccountModel productAccount
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(productAccount),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/SetAccountToProduct", content);

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
        public async Task<IActionResult> GetProductWorkflows(int intPkProduct, int? intnJobId = null)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intPkProduct = intPkProduct,
                intnJobId = intnJobId,
                boolEstimate = false
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
                    List<ProductWorkflow> darrprowork = JsonSerializer
                        .Deserialize<List<ProductWorkflow>>(jsonResponseModel.objResponse.ToString());

                    ViewBag.intPkProduct = intPkProduct;
                    aresult = PartialView("WorkflowModalPartialView", darrprowork);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> AddNewWorkflow(NewWorkflowModel newWorkflowModel)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(newWorkflowModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/AddNewWorkflow", content);

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
        public async Task<IActionResult> DeleteWorkflow(int intPkWorkflow)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var obj = new
            {
                intPkWorkflow = intPkWorkflow
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/Delete", content);

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
        public async Task<IActionResult> MakeDefault(int intPkWorkflow)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var obj = new
            {
                intPkWorkflow = intPkWorkflow
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/MakeDefault", content);

            if (response.IsSuccessStatusCode)
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }
        
        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetFromWisnet(FilterModel filter)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Product/GetFromWisnet?{filter}"),
                Content = new StringContent(JsonSerializer.Serialize(filter),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            List<PrintshopProductTemplateModel> darrstrCustomTemplateId = new List<PrintshopProductTemplateModel>();
            if (response.IsSuccessStatusCode)
            {
                result = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    await darrGetAllAccountsRevenueAvailable();
                    darrstrCustomTemplateId = JsonSerializer
                        .Deserialize<List<PrintshopProductTemplateModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            ViewBag.darrstrCustomTemplateId = darrstrCustomTemplateId;
            return PartialView("ProductsFilteredPartialView");
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetGeneric(
            int intPkWorkflow
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var obj = new
            {
                intPkWorkflow = intPkWorkflow
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/workflow/SetGeneric", content);

            if (response.IsSuccessStatusCode)
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
        private async Task<List<PrintshopProductTemplateModel>> GetProducts(int? intnOrderType)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client
                .GetAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Type/GetPrintshopTypes?strPrintshopId=" +
                this.strPrintshopId + "&strResOrPro=Product&intnOrderType=" + intnOrderType);

            List<PrintshopProductTemplateModel> darrstrCustomTemplateId = new List<PrintshopProductTemplateModel>();
            if (response.IsSuccessStatusCode)
            {
                result = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrstrCustomTemplateId = JsonSerializer
                        .Deserialize<List<PrintshopProductTemplateModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrstrCustomTemplateId;
        }
        
        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        private async Task darrGetAllAccountsRevenueAvailable()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client
                .GetAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAllAccountsRevenueAvailable");

            List<AccountModel> darraccRevenueAccounts = new List<AccountModel>();
            JsonResponseModel jsonResponseModel = new JsonResponseModel(400, "Something is wrong.", null, null, false,
                null, false, null, null);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                //jsonResponseModel.objResponse = "[{\"intPk\":1,\"strName\":\"Folding\"},{\"intPk\":2,\"strName\":\"Trimm\"}]";

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darraccRevenueAccounts = JsonSerializer
                        .Deserialize<List<AccountModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            ViewBag.darraccRevenueAccounts = darraccRevenueAccounts;
        }

        //--------------------------------------------------------------------------------------------------------------
        private async Task GetProcessesInWorkflow(int intPkWorkflow)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client
                .GetAsync(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Workflow/GetProcessesInWorkflow?intPkWorkflow=" + intPkWorkflow);

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
                    ViewBag.darrProcess = JsonSerializer
                        .Deserialize<List<ProductProcessesInWorkflowModel>>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
