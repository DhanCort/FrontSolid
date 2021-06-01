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

//                                                          //AUTHOR: Towa (EAPC - Adad Perez).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Jun 11, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class ProcessPeriodController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public ProcessPeriodController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> PeriodIsAddable(ProcessPeriodModel period)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Process/PeriodIsAddable?period={period}"),
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
                    if (
                        //                                  //Is a new record.     
                        period.intnPkPeriod == null
                        )
                    {
                        jsonResponse.objResponse = new
                        {
                            boolIsAddableAboutPeriods = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutPeriods").GetBoolean(),
                            boolIsAddableAboutRules = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutRules").GetBoolean(),
                            boolIsAddableAboutEmployeesPeriods = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutEmployeesPeriods").GetBoolean()
                        };
                    }
                    else
                    {
                        jsonResponse.objResponse = new
                        {
                            boolIsAddableAboutPeriods = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutPeriods").GetBoolean(),
                            boolIsAddableAboutRules = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutRules").GetBoolean(),
                            boolIsAddableAboutEmployeesPeriods = ((JsonElement)jsonResponse.objResponse)
                            .GetProperty("boolIsAddableAboutEmployeesPeriods").GetBoolean(),
                            period = jsonResponse.objResponse = JsonSerializer
                            .Deserialize<JobCalculationModel>(jsonResponse.objResponse.ToString())
                        };
                    }
                }
                else if (jsonResponse.objResponse != null)
                {
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<JobCalculationModel>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }
            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetPeriod(ProcessPeriodModel period)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(period),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/SetPeriod", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponseModel.objResponse != null
                    )
                {
                    jsonResponseModel.objResponse = JsonSerializer
                        .Deserialize<JobCalculationModel>(jsonResponseModel.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeletePeriod(int intnPkPeriod)
        {
            var obj = new
            {
                intnPkPeriod = intnPkPeriod
            };

            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/DeletePeriod", content);

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
        public async Task<IActionResult> GetOnePeriod(int intPkPeriod)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Process/GetOnePeriod?intPkPeriod=" + intPkPeriod);

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
    }

    //==================================================================================================================
}
/*END-TASK*/
