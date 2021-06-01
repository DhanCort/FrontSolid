/*TASK RP. REPORT*/
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
using Odyssey2Frontend.Job;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Sep 01, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopReportsController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopReportsController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public IActionResult Index()
        {
            return View();
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetJobsReportView()
        {
            await GetReportFilters("Jobs");
            return PartialView("JobReportPartialView");
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetJobsDataSet()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            List<JobsModel> darrjobspending = await subGetJobs();

            IEnumerable<JobsModel> darrjobs = darrjobspending;
            darrjobs.OrderBy(o => o.strProductName);

            aresult = base.Ok(darrjobs);

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public FileContentResult DownloadJobsReport(
                List<JobsModel> darrjobsmodel,
                List<ReportModel> arrcolJobs
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            JobpdfJobPdf pdfDoc = new JobpdfJobPdf(darrjobsmodel, arrcolJobs);

            return File(pdfDoc.GeneratePdf(), "application/pdf", "jobs.pdf");
        }
        
        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public FileContentResult DownloadCustomersReport(
                List<PrintshopCustomerModel> darrcustomermodel,
                List<ReportModel> arrcolCustomers
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            CuspdfCustomerPdf pdfDoc = new CuspdfCustomerPdf(darrcustomermodel, arrcolCustomers);

            return File(pdfDoc.GeneratePdf(), "application/pdf", "customers.pdf");
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public FileContentResult DownloadAccountsReport(
                List<AccountModel> darraccountmodel,
                List<ReportModel> arrcolAccounts
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            AcopdfAccountPdf pdfDoc = new AcopdfAccountPdf(darraccountmodel, arrcolAccounts);

            return File(pdfDoc.GeneratePdf(), "application/pdf", "customers.pdf");
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCustomersReportView()
        {
            await GetReportFilters("Customers");
            return PartialView("CustomersReportPartialView");
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCustomersDataSet()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/customer/GetAllForAPrintshop");
            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = JsonSerializer.Deserialize<List<PrintshopCustomerModel>>(
                        jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAccountsReportView()
        {
            await GetReportFilters("Accounts");
            return PartialView("AccountsReportPartialView");
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAccountsDataSet(
            String strStartDate,
            String strStartTime,
            String strEndDate,
            String strEndTime
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

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

                        aresult = base.Ok(jsonResponseModel.objResponse);
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

                        aresult = base.Ok(jsonResponseModel.objResponse);
                    }
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetReportFilter(CustomReportModel customReport)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(customReport),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Printshop/SetReportFilter", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                jsonResponse.objResponse = JsonSerializer
                        .Deserialize<int>(jsonResponse.objResponse.ToString());

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetReportFilters(String strDataSet)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetReportFilters?strDataSet=" + strDataSet);

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
                    ReportRedyPrintshopModel reportRedyPrintshopModel = JsonSerializer
                        .Deserialize<ReportRedyPrintshopModel>(jsonResponse.objResponse.ToString());

                    ViewBag.darrReports = new SelectList(reportRedyPrintshopModel.arrrepPrintshop,
                        "intPk", "strName");

                    ViewBag.darrReady = new SelectList(reportRedyPrintshopModel.arrrepReadyToUse,
                        "intPk", "strName");

                    aresult = base.Ok(jsonResponse);
                    //ViewBag.Companies = new SelectList(darrCompanies, "intCompanyId", "strName");
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOneReportFilter(int intPk)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/getonereportfilter?intPk=" + intPk);

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
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<CustomReportModel>(jsonResponse.objResponse.ToString());

                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeleteReportFilter(int intPk)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            Object obj = new
            {
                intPk = intPk
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Printshop/DeleteReportFilter", content);

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

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public async Task<List<JobsModel>> subGetJobs()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            String strResult = null;

            Object obj = new
            {
                boolnAll = true
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

            return darrjobs;
        }        

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    }

    //==================================================================================================================
}
/*END-TASK*/
