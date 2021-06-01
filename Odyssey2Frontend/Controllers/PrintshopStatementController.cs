/*TASK RP. STATEMENT*/
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
using Odyssey2Frontend.Accounting;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Dec 8, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopStatementController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopStatementController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            aresult = PartialView("AddStatementPartialView");

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCustomersBalances(String strBalanceStatus)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetCustomersBalances?strBalanceStatus=" + strBalanceStatus);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<StatementModel>>(
                        jsonResponse.objResponse.ToString());
                    //jsonResponse.objResponse = JsonSerializer.Deserialize<List<StatementModel>>(
                    //    "[{\"intContactId\":1212,\"strFullName\":\"Juan Perez\",\"numBalance\":23323.23},{\"intContactId\":121223,\"strFullName\":\"Mar\u00eda Perez\",\"numBalance\":23323.23}]");

                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetStatement(
            GetStatementModel getStatementModel
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetStatement"),
                Content = new StringContent(JsonSerializer.Serialize(getStatementModel),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something is wrong.", null, null, false, null,
                false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                aresult = base.Ok(jsonResponse);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    StatementPdfModel statementPdfModel = JsonSerializer
                        .Deserialize<StatementPdfModel>(jsonResponse.objResponse.ToString());

                    StapdfStatementPdf invpdfInvoicePdf = new StapdfStatementPdf(statementPdfModel, 
                        getStatementModel.strType);

                    aresult = base.Ok(Convert.ToBase64String(
                        new MemoryStream(invpdfInvoicePdf.arrbyteGenerateCreditMemo()) .ToArray()));
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }
    //==================================================================================================================
}
/*END-TASK*/
