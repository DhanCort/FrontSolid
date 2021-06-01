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
//                                                          //DATE: May 04, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PeriodController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PeriodController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }
        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> PeriodIsAddable(PeriodModel period)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/resource/PeriodIsAddable?period={period}"),
                Content = new StringContent(JsonSerializer.Serialize(period),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponse.intStatus == 200)
                {
                    object obj = new
                    {
                        boolIsAddableAboutPeriods = ((JsonElement)jsonResponse.objResponse)
                        .GetProperty("boolIsAddableAboutPeriods").GetBoolean(),
                        boolIsAddableAboutRules = ((JsonElement)jsonResponse.objResponse)
                        .GetProperty("boolIsAddableAboutRules").GetBoolean()
                    };

                    jsonResponse.objResponse = obj;
                }
                aresult = base.Ok(jsonResponse);
            }
            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddPeriod(PeriodModel period)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(period),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Resource/AddPeriod", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                if (jsonResponseModel.intStatus == 200)
                {
                    jsonResponseModel.objResponse = JsonSerializer.Deserialize<PeriodResponseModel>(
                        jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetWeek(int intPkResource, String strDate)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/resource/getweek?intPkResource=" + intPkResource + "&strDate=" + strDate);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse = JsonSerializer.Deserialize<List<WeekPeriodsModel>>(jsonResponse.objResponse.ToString());
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetDay(int intPkResource, String strDate)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/resource/GetDay?intPkResource=" + intPkResource + "&strDate=" + strDate);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse = JsonSerializer.Deserialize<WeekPeriodsModel>(jsonResponse.objResponse.ToString());
                aresult = PartialView("PeriodsByDayPartialView", jsonResponse.objResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetPeriod(int intPkPeriod)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/resource/GetPeriod?intPkPeriod=" + intPkPeriod);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse = JsonSerializer.Deserialize<PeriodModel>(jsonResponse.objResponse.ToString());
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> ModifyPeriod(PeriodModel period)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(period),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Resource/ModifyPeriod", content);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                if (jsonResponseModel.intStatus == 200)
                {
                    PeriodResponseModel periodResponse = JsonSerializer
                        .Deserialize<PeriodResponseModel>(jsonResponseModel.objResponse.ToString());
                    periodResponse.intPkPeriod = period.intPkPeriod;
                    jsonResponseModel.objResponse = periodResponse; 
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeletePeriod(int intPkPeriod)
        {
            var obj = new
            {
                intPkPeriod = intPkPeriod
            };

            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Resource/DeletePeriod", content);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
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
        public async Task<IActionResult> GetAvailableTimes(PeriodModel periodModel)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/resource/GetAvailableTimes?intPkResource={periodModel.intPkResource}" 
                + $"&intJobId={periodModel.intJobId}&intPkProcessInWorkflow={periodModel.intPkProcessInWorkflow}" 
                + $"&intPkEleetOrEleele={periodModel.intPkEleetOrEleele}" 
                + $"&boolIsEleet={periodModel.boolIsEleet}");

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponse.objResponse = JsonSerializer.Deserialize<PeriodModel>(jsonResponse.objResponse.ToString());
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetResourcePeriodsInIoFormJob(int intPkResource, int intJobId, 
            int intPkProcessInWorkflow, int intPkEleetOrEleele, bool boolIsEleet)
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/job/GetResourcePeriodsInIoFromJob?intJobId={intJobId}&intPkResource={intPkResource}" +
                $"&intPkProcessInWorkflow={intPkProcessInWorkflow}&intPkEleetOrEleele={intPkEleetOrEleele}" +
                $"&boolIsEleet={boolIsEleet}");

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if(
                    jsonResponse.intStatus == 200
                    )
                {
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<List<ResPerResourcePerdiodModel>>(jsonResponse.objResponse.ToString());
                }
                
                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEmployees()
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Printshop/GetEmployees");

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
                    PrintshopSupervisorEmployeeModel printshopSupervisorEmployeeModel = JsonSerializer
                        .Deserialize<PrintshopSupervisorEmployeeModel>(jsonResponse.objResponse.ToString());

                    jsonResponse.objResponse = printshopSupervisorEmployeeModel.arrEmployee
                        .OrderBy(printEmp => printEmp.intContactId).ToList();
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
