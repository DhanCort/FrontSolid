/*TASK RP. PAPERTRANSFORMATION*/
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
//                                                          //DATE: Sep 18, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PaperTransformationController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PaperTransformationController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOnePaperTransformation(
            GetPaperTransformationInModel getPaperTransformation)
        {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/GetOnePaperTransformation?{getPaperTransformation}"),
                Content = new StringContent(JsonSerializer.Serialize(getPaperTransformation),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponseModel.objResponse = jsonResponseModel.objResponse == null ? null :
                    JsonSerializer.Deserialize<GetPaperTransformationOutModel>
                    (jsonResponseModel.objResponse.ToString());
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SaveTemporaryPaper(SavePaperTransformationModel paperTransformation)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(paperTransformation),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/SavePaperTransformation", content);

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
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetProperty("intPkPatrans")
                        .GetInt32();

                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> GetCalculatedCuts(PaperTransformationModel paperTransformation)
            {
            IActionResult aresult = base.BadRequest("Invalid Data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/GetCalculatedCuts?{paperTransformation}"),
                Content = new StringContent(JsonSerializer.Serialize(paperTransformation),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);

            if (
            response.IsSuccessStatusCode
            )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(result);
                jsonResponseModel.objResponse = JsonSerializer.Deserialize<CalculatedCutsPaperTransformationModel>
                    (jsonResponseModel.objResponse.ToString());

                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> DeletePaper(int intPkPaTrans, int? intnPkCalculation, bool boolFromClose)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            Object obj = new
            {
                intPkPaTrans = intPkPaTrans,
                intnPkCalculation = intnPkCalculation,
                boolFromClose = boolFromClose
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Calculation/DeletePaperTransformation", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();

                // strResult = "{\"intStatus\":200,\"strUserMessage\":\"Success.\",\"strDevMessage\":\"\",\"objResponse\":{\"numCutWidth\":15,\"numCutHeigth\":3,\"intRows\":3,\"intColumns\":1,\"intPerUnit\":3,\"strUnit\":\"in\"}}";
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
