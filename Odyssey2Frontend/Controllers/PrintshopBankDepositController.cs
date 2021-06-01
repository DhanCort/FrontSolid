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
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Accounting;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Dec 9, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopBankDepositController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopBankDepositController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            await subGetBankAccounts();

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetOpenPayments");

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<BankDepositModel>>(
                        jsonResponse.objResponse.ToString());
                    //jsonResponse.objResponse = JsonSerializer.Deserialize<List<BankDepositModel>>("[{\"intPkPayment\":1,\"strCustomerFullName\":\"\",\"strDate\":\"\",\"strMethodName\":\"\",\"strReference\":\"1224ADS\",\"numAmount\":23.2},{\"intPkPayment\":2,\"strCustomerFullName\":\"\",\"strDate\":\"\",\"strMethodName\":\"\",\"strReference\":\"1224ADS22\",\"numAmount\":50.22}]");

                    aresult = PartialView("BankDepositPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetBankDepositsInARange
        (
            String strStartDate,
            String strEndDate,
            int intPkBankAccount
        )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                strStartDate = strStartDate,
                strEndDate = strEndDate,
                intPkBankAccount = intPkBankAccount
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetBankDepositsInARange"),
                Content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<BankDepositsInARangeModel>>
                        (jsonResponse.objResponse.ToString());

                    //jsonResponse.objResponse = JsonSerializer.Deserialize<List<BankDepositsInARangeModel>>
                    //    ("[{\"intPkBankDeposit\":1,\"strDate\":\"\"},{\"intPkBankDeposit\":2,\"strDate\":\"\"}]");

                    aresult = PartialView("AccountsBankDepositsPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddBankDeposit
        (
            String strDate,
            int intPkAccount,
            List<int> arrintPkPayment,
            bool boolPrintBankDeposit
        )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                strDate = strDate,
                intPkAccount = intPkAccount,
                arrintPkPayment = arrintPkPayment
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/AddBankDeposit", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
                if (
                    jsonResponse.intStatus == 200 && boolPrintBankDeposit
                    )
                {
                    BankDepositSummaryModel bankDepositSummaryModel = JsonSerializer
                        .Deserialize<BankDepositSummaryModel>(jsonResponse.objResponse.ToString());

                    BanDeppdfBankDepositPdf banDeppdfBankDepositPdf = new
                        BanDeppdfBankDepositPdf(bankDepositSummaryModel);

                    aresult = base.Ok(Convert.ToBase64String(
                        new MemoryStream(banDeppdfBankDepositPdf.arrbyteGenerateBankDepositSummary()).ToArray()));
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAccountBalance
        (
            int intPk
        )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            await subGetBankAccounts();

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAccountBalance?intPk=" + intPk);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<double>(
                        jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetBankDepositSummary(
            int intPkBankDeposit
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetBankDepositSummary?intPkBankDeposit=" + intPkBankDeposit);

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
                    BankDepositSummaryModel bankDepositSummaryModel = JsonSerializer
                        .Deserialize<BankDepositSummaryModel>(jsonResponse.objResponse.ToString());

                    BanDeppdfBankDepositPdf banDeppdfBankDepositPdf = new 
                        BanDeppdfBankDepositPdf(bankDepositSummaryModel);

                    aresult = base.Ok(Convert.ToBase64String(
                        new MemoryStream(banDeppdfBankDepositPdf.arrbyteGenerateBankDepositSummary()).ToArray()));
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetBankAccounts()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");
            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetBankAccounts?boolUndepositedFunds=false");
            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<BankAccountsModel>>(
                        jsonResponse.objResponse.ToString());

                    ViewBag.darrBankAccount = new SelectList((List<BankAccountsModel>)jsonResponse.objResponse,
                        "intPk", "strName");
                }
            }
        }
    }
    //==================================================================================================================
}
/*END-TASK*/
