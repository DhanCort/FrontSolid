/*TASK RP. INVOICES*/
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
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Invoice;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //DATE: November 11, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================

    public class InvoiceController : BaseController
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public InvoiceController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetPrintshopOrders");

            List<CompletedOrderModel> completedOrderModel = new List<CompletedOrderModel>();
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
                    completedOrderModel = JsonSerializer
                        .Deserialize<List<CompletedOrderModel>>(jsonResponse.objResponse.ToString());
                }
            }

            return View(completedOrderModel);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> EditInvoice(
            int intPkInvoice
            )
        {
            JsonResponseModel jsonResponse = await GetInvoiceData(intPkInvoice);
            var arrJobData = ((InvoiceModel)jsonResponse.objResponse).darrinvjobinfojson;

            ViewBag.strarrjobs = JsonSerializer.Serialize(new List<JobDataModel>());
            if (
                arrJobData != null
                ) {
                ViewBag.strarrjobs = JsonSerializer.Serialize(arrJobData.Where(job => job.intnJobId > 0).DefaultIfEmpty().ToList());
            }

            ViewBag.intPkInvoice = intPkInvoice;
            return View(jsonResponse.objResponse);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> EditInvoice(
            InvoiceModel invoiceModel
            )
        {
            invoiceModel.strShippedToZip = (invoiceModel.strShippedToZip != null) ? invoiceModel.strShippedToZip : "";
            ActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(invoiceModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Accounting/EditInvoice", content);

            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GenerateInvoice(
            GenerateInvoiceModel generateInvoiceModel
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(generateInvoiceModel),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Accounting/AddInvoice", content);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something is Wrong.", "", null, false, "", false,
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
                    jsonResponse.objResponse = JsonSerializer.Deserialize<InvoiceModel>(
                        jsonResponse.objResponse.ToString());

                    InvpdfInvoicePdf invpdfInvoicePdf = new InvpdfInvoicePdf((InvoiceModel)jsonResponse.objResponse);

                    aresult = base.Ok(Convert.ToBase64String(new MemoryStream(invpdfInvoicePdf.arrbyteGenerateInvoice())
                        .ToArray()));
                }
                else
                {
                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetInvoice(
            int intPkInvoice
            )
        {
            IActionResult aresult = BadRequest();
            JsonResponseModel jsonResponse = await GetInvoiceData(intPkInvoice);

            if (
                jsonResponse.intStatus == 200
                )
            {
                InvpdfInvoicePdf invpdfInvoicePdf = new InvpdfInvoicePdf((InvoiceModel)jsonResponse.objResponse);

                aresult = base.Ok(Convert.ToBase64String(new MemoryStream(invpdfInvoicePdf.arrbyteGenerateInvoice())
                    .ToArray()));
            }
            else
            {
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllAccountsRevenueAvailable()
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAllAccountsRevenueAvailable");

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something Wrong.", "", null, false, "", false,
                null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                //jsonResponse.intStatus = 200;
                //jsonResponse.objResponse = "[{\"intPk\":1,\"strName\":\"Folding\"},{\"intPk\":2,\"strName\":\"Trimm\"}]";

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<List<AccountModel>>(jsonResponse.objResponse.ToString());
                }
            }

            aresult = base.Ok(jsonResponse);
            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<JsonResponseModel> GetInvoiceData(
            int intPkInvoice
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetInvoice?intPkInvoice=" + intPkInvoice);

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
                        .Deserialize<InvoiceModel>(jsonResponse.objResponse.ToString());
                }
            }

            return jsonResponse;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================

}
/*END-TASK*/
