/*TASK RP. PERIOD*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Jun 03, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JobPeriodController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public JobPeriodController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetCalendar(
            int intJobId, 
            int intPkWorkflow, 
            String strSunday,
            bool boolIsInformative
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetCalendar?intJobId="+ intJobId + "&intPkWorkflow=" 
                + intPkWorkflow + "&strSunday=" + strSunday);
            JsonResponseModel jsonResponseModel = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<JobCalendarModel>(jsonResponseModel.objResponse.ToString());
                }

                ViewBag.intJobId = intJobId;
                ViewBag.boolIsInformative = boolIsInformative;
                aresult = PartialView("~/Views/Jobs/JobCalendarPartialView.cshtml", 
                    jsonResponseModel.objResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPeriodsFromOneProcess(
            int intPk,
            int intJobId
            )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetPeriodsFromOneProcess?intPkPIW=" + intPk + "&intJobId=" + intJobId);
            JsonResponseModel jsonResponseModel = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);
                aresult = base.Ok(jsonResponseModel);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<JobProcessAndResourcesInWorkflowModel>(jsonResponseModel.objResponse.ToString());

                    aresult = PartialView("~/Views/Jobs/ProcessPeriods.cshtml",
                        jsonResponseModel.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetProcessesAndCalculationsWithPeriods(
            int intJobId, 
            int intPkWorkflow, 
            String strSunday
        )
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetProcessesAndCalculationsWithPeriods?intJobId=" + intJobId + "&intPkWorkflow="
                + intPkWorkflow + "&strSunday=" + strSunday);
            JsonResponseModel jsonResponseModel = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<List<JobProcessModel>>(jsonResponseModel.objResponse.ToString());
                }

                ViewBag.intJobId = intJobId;
                ViewBag.intPkWorkflow = intPkWorkflow;
                ViewBag.strSunday = strSunday;

                aresult = PartialView("~/Views/Jobs/JobProcessesCalculationsPeriods.cshtml", 
                    jsonResponseModel.objResponse);
            }
            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEndOfPeriod(ProcessPeriodModel period)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/process/GetEndOfPeriod?{period}"),
                Content = new StringContent(JsonSerializer.Serialize(period),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

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
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<ProcessPeriodModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> DeletePeriod(int intPkPeriod)
        {
            ActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            object objPeriod = new
            {
                intPkPeriod = intPkPeriod
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(objPeriod),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Process/DeletePeriod", content);

            JsonResponseModel jsonResponseModel = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (jsonResponseModel.intStatus == 200)
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<PeriodResponseModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
