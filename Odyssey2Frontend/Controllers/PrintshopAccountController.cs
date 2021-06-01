/*TASK RP. ACCOUNT*/
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Accounting;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Oct 29, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopAccountController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopAccountController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAllAccounts");
            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    await subGetAccountTypes();
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<AccountModel>>(
                        jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse.objResponse);
                }
            }

            return View(jsonResponse.objResponse);
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddAccount(String strNumber, String strName, int intPkType)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                strNumber = strNumber,
                strName = strName,
                intPkType = intPkType
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/AddAccount", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                //jsonResponse.objResponse = JsonSerializer.Deserialize<List<PrintshopCustomerModel>>(
                //        jsonResponse.objResponse.ToString());

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> EnableDisable(
            int intPk,
            bool boolEnabled
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intPkAccount = intPk,
                boolEnabled = boolEnabled
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/EnableDisable", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAccount(
            int intPk
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Accounting/GetAccount?intPk=" + intPk);

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
                    jsonResponse.objResponse = JsonSerializer.Deserialize<AccountModel>(
                        jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> UpdateAccount(
            int intPk,
            String strNumber,
            String strName
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
            Object obj = new
            {
                intPk = intPk,
                strNumber = strNumber,
                strName = strName
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");
            
            HttpResponseMessage response = await client.PostAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Accounting/UpdateAccount", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AccountReport(
            String strStartDate,
            String strStartTime,
            String strEndDate,
            String strEndTime
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (
                strStartDate == null ||
                strStartTime == null ||
                strEndDate == null ||
                strEndTime == null
                )
            {
                DateTime datetime = DateTime.Now;
                strEndDate = datetime.Date.ToString("yyyy-MM-dd");
                strStartTime = datetime.TimeOfDay.ToString(@"hh\:mm\:ss");
                strStartDate = (new DateTime(datetime.Year, datetime.Month - 1, datetime.Day)).ToString("yyyy-MM-dd");
                strEndTime = strStartTime;

                var request = new HttpRequestMessage
                {
                    Method = HttpMethod.Get,
                    RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetAccountsWithMovementsInAPeriod"),
                    Content = new StringContent(JsonSerializer.Serialize(new
                    {
                        strStartDate = strStartDate,
                        strStartTime = strStartTime,
                        strEndDate = strEndDate,
                        strEndTime = strEndTime
                    }),
                Encoding.UTF8, "application/json")
                };

                HttpResponseMessage response = await client.SendAsync(request);

                if (
                    response.IsSuccessStatusCode
                    )
                {
                    String strResult = await response.Content.ReadAsStringAsync();
                    JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                    aresult = base.Ok(jsonResponseModel);

                    if (
                        jsonResponseModel.intStatus == 200
                        )
                    {
                        jsonResponseModel.objResponse = JsonSerializer.Deserialize<List<AccountMovementsDetailsModel>>(
                            jsonResponseModel.objResponse.ToString());

                        ViewBag.accountmovementsmodel = jsonResponseModel;
                        ViewBag.strStartDateTime = strStartDate + " " + strStartTime.Substring(0, strStartTime.LastIndexOf(":"));
                        ViewBag.strEndDateTime = strEndDate + " " + strEndTime.Substring(0, strStartTime.LastIndexOf(":"));

                        aresult = View();
                    }
                }

            }
            else
            {
                var request = new HttpRequestMessage
                {
                    Method = HttpMethod.Get,
                    RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetAccountsWithMovementsInAPeriod"),
                    Content = new StringContent(JsonSerializer.Serialize(new
                    {
                        strStartDate = strStartDate,
                        strStartTime = strStartTime,
                        strEndDate = strEndDate,
                        strEndTime = strEndTime
                    }),
                Encoding.UTF8, "application/json")
                };

                HttpResponseMessage response = await client.SendAsync(request);

                if (
                    response.IsSuccessStatusCode
                    )
                {
                    String strResult = await response.Content.ReadAsStringAsync();
                    JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                    aresult = base.Ok(jsonResponseModel);

                    if (
                        jsonResponseModel.intStatus == 200
                        )
                    {
                        jsonResponseModel.objResponse = JsonSerializer.Deserialize<List<AccountMovementsDetailsModel>>(
                            jsonResponseModel.objResponse.ToString());

                        aresult = PartialView("ReportAccountTablePartialView", jsonResponseModel);
                    }
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAccountMovements(
            AccountDetailsByPeriod accountDetailsByPeriod
            )
        {
            if (
                accountDetailsByPeriod.strStartDate == null
                )
            {
                DateTime datetime = DateTime.Now;
                accountDetailsByPeriod.strEndDate = datetime.Date.ToString("yyyy-MM-dd");
                accountDetailsByPeriod.strStartTime = datetime.TimeOfDay.ToString(@"hh\:mm\:ss");
                DateTime datetimeStart = datetime.AddMonths(-1);
                accountDetailsByPeriod.strStartDate = (datetimeStart).ToString("yyyy-MM-dd");
                //accountDetailsByPeriod.strStartDate = (new DateTime(datetime.Year, datetime.Month - 1, datetime.Day))
                //    .ToString("yyyy-MM-dd");
                accountDetailsByPeriod.strEndTime = accountDetailsByPeriod.strStartTime;
            }

            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetAccountMovement"),
                Content = new StringContent(JsonSerializer.Serialize(accountDetailsByPeriod),
                Encoding.UTF8, "application/json")
            };

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something is wrong.", null, null, false, null,
                false, null, null);
            HttpResponseMessage response = await client.SendAsync(request);

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
                        .Deserialize<AllAccountDetailsModel>(jsonResponse.objResponse.ToString());

                    aresult = PartialView("AccountDetailsPartialView", jsonResponse.objResponse);

                    ViewBag.strStartDateTime = accountDetailsByPeriod.strStartDate + accountDetailsByPeriod.strStartTime;
                    ViewBag.strEndDateTime = accountDetailsByPeriod.strEndDate + accountDetailsByPeriod.strEndTime;
                    ViewBag.intPkAccount = accountDetailsByPeriod.intPkAccount;
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCustomers()
        {
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Customer/GetCustomers");

            List<CustomerPaymentModel> darrcustomerpayment = new List<CustomerPaymentModel>();
            JsonResponseModel jsonResponse = new JsonResponseModel();
            String result = null;
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    darrcustomerpayment = JsonSerializer.Deserialize<List<CustomerPaymentModel>>(
                        jsonResponse.objResponse.ToString());
                }
            }

            return Ok(darrcustomerpayment);
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetInvoicesToPayment(
            int intContactId
            )
        {
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetInvoices?intContactId=" + intContactId);

            List<InvoicePaymentModel> darrinvoicepayment = new List<InvoicePaymentModel>();
            JsonResponseModel jsonResponse = new JsonResponseModel();
            String result = null;
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    darrinvoicepayment = JsonSerializer.Deserialize<List<InvoicePaymentModel>>(
                        jsonResponse.objResponse.ToString());
                }
            }

            return Ok(darrinvoicepayment);
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddPayment(
            PaymentModel payment
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(payment),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/AddPayment", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.objResponse != null
                    ) 
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<int[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> UploadTaxFile(IList<IFormFile> taxFile)
        {
            IActionResult aresult = BadRequest("Invalid data.");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            foreach (IFormFile file in taxFile)
            {
                string filename = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                string extension = Path.GetExtension(file.FileName);

                if (extension == ".tab")
                {

                    using (StreamReader reader = new StreamReader(file.OpenReadStream()))
                    {
                        string contentAsString = reader.ReadToEnd();
                        byte[] bytes = new byte[contentAsString.Length * sizeof(char)];
                        System.Buffer.BlockCopy(contentAsString.ToCharArray(), 0, bytes, 0, bytes.Length);

                        Object obj = new
                        {
                            taxFile = bytes,
                            strFileExt = extension
                        };

                        HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                            Encoding.UTF8, "application/json");

                        HttpResponseMessage response = await client.PostAsync(
                                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                                + $"/Accounting/UploadTaxesFile", content);

                        if (
                            response.IsSuccessStatusCode
                        )
                        {
                            String strResult = await response.Content.ReadAsStringAsync();
                            JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                            //jsonResponse.objResponse = JsonSerializer.Deserialize<List<PrintshopCustomerModel>>(
                            //        jsonResponse.objResponse.ToString());

                            aresult = base.Ok(jsonResponse);
                        }
                    }
                }
                else
                {
                    JsonResponseModel jsonResponse = new JsonResponseModel()
                    {
                        intStatus = 400,
                        strUserMessage = "Only .tab files are allowed."
                    };

                    aresult = base.Ok(jsonResponse);
                }
                //byte[] bytes = System.IO.File.ReadAllBytes(filename);
            }


            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPaymentMethods()
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetPaymentMethods");

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<PaymentMethodsAndBankAccounts[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }
        
        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetBankAccounts(
            bool boolUndepositedFunds
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetBankAccounts?boolUndepositedFunds=" + boolUndepositedFunds);

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<PaymentMethodsAndBankAccounts[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }
        
        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOpenInvoices(
            int? intnContactId,
            int? intnOrderNumber
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Customer/GetOpenInvoices?intnContactId=" + intnContactId + "&intnOrderNumber=" + 
                    intnOrderNumber);

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<OpenInvoicesModel>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCredits(
            int? intnContactId,
            int? intnOrderNumber
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Customer/GetCredits?intnContactId=" + intnContactId + "&intnOrderNumber=" + intnOrderNumber);

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<OpenCreditsModel[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOverpaidInvoices(
            int intContactId
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetOverpaidInvoices?intContactId=" + intContactId);
            JsonResponseModel jsonResponse = new JsonResponseModel(400,"Something is wrong.", null, null, false, null,
                false, null, null);
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
                        .Deserialize<OverpaidInvoicesModel[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> AddCreditMemo(
            NewCreditMemoModel creditMemoModel
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            creditMemoModel.boolIsExempt = !creditMemoModel.boolIsExempt;
            HttpContent content = new StringContent(JsonSerializer.Serialize(creditMemoModel),
                            Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/AddCreditMemo", content);

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
                    jsonResponse.intStatus == 200 && creditMemoModel.boolPrint
                    )
                {
                    CreditMemoForPDFModel creditMemoForPDFModel = JsonSerializer
                        .Deserialize<CreditMemoForPDFModel>(jsonResponse.objResponse.ToString());

                    CrepdfCreditPdf invpdfInvoicePdf = new CrepdfCreditPdf(creditMemoForPDFModel);

                    aresult = base.Ok(Convert.ToBase64String(
                        new MemoryStream(invpdfInvoicePdf.arrbyteGenerateCreditMemo()).ToArray()));
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCreditMemos(
            int? intnContactId
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Customer/GetCreditMemos?intnContactId=" + intnContactId);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something is wrong.", null, null, false, null,
                false, null, null);
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
                        .Deserialize<CreditMemoModel[]>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetContactBillingAddress(
            int intContactId
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetContactBillingAddress?intContactId=" + intContactId);

            JsonResponseModel jsonResponse = new JsonResponseModel(400, "Something is wrong.", null, null, false, null,
                false, null, null);
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
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetProperty("strAddress").GetString();
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCreditMemo(
            int intPkCreditMemo
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Accounting/GetCreditMemo?intPkCreditMemo=" + intPkCreditMemo);

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
                    CreditMemoForPDFModel creditMemoForPDFModel = JsonSerializer
                        .Deserialize<CreditMemoForPDFModel>(jsonResponse.objResponse.ToString());

                    CrepdfCreditPdf invpdfInvoicePdf = new CrepdfCreditPdf(creditMemoForPDFModel);

                    aresult = base.Ok(Convert.ToBase64String(
                        new MemoryStream(invpdfInvoicePdf.arrbyteGenerateCreditMemo()) .ToArray()));
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task subGetAccountTypes()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");
            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Accounting/GetAccountTypes");
            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<AccountTypeModel>>(
                        jsonResponse.objResponse.ToString());

                    ViewBag.darrType = new SelectList((List<AccountTypeModel>)jsonResponse.objResponse,
                        "intPkType", "strName");
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    }
    //==================================================================================================================
}
/*END-TASK*/
