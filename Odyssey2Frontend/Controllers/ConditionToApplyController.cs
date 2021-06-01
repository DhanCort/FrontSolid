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
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: May 04, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class ConditionToApplyController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public ConditionToApplyController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> GetConditions(
            int intPk,
            bool boolIsLink,
            bool boolSetCondition,
            int? intnPkProduct,
            int? intnPkCalculation,
            int? intnPkOut,
            int? intnPkIn,
            int? intnPkTransformCalculation,
            String condition
            )
        {
            String strCondition = condition;

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            String strResult = null;

            Object obj = new
            {
                intnPkCalculation = intnPkCalculation,
                intnPkOut = intnPkOut,
                intnPkIn = intnPkIn,
                intnPkTransformCalculation = intnPkTransformCalculation
            };

            if (
                condition == "null"
                )
            {
                var request = new HttpRequestMessage
                {
                    Method = HttpMethod.Get,
                    RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                        + $"/Workflow/GetConditions"),
                    Content = new StringContent(JsonSerializer.Serialize(obj),
                    Encoding.UTF8, "application/json")
                };

                HttpResponseMessage response = await client.SendAsync(request);

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
                        jsonResponseModel.intStatus == 200 &&
                        jsonResponseModel.objResponse != null
                        )
                    {
                        //                                      /Deserialize the objResponse;
                        strCondition = jsonResponseModel.objResponse.ToString();
                    }
                }
            }

            ViewBag.ConditionObject = strCondition;
            ViewBag.boolIsLink = boolIsLink;
            ViewBag.boolSetCondition = boolSetCondition;
            await subGetAttributesAndValues(intnPkProduct);

            return PartialView("ConditionToApply");
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index(
            bool boolCondition, 
            bool boolGeneral, 
            int? intnPkProduct,
            bool boolFromGroup
            )
        {
            ViewBag.boolCondition = boolCondition;
            ViewBag.boolGeneral = boolGeneral;
            ViewBag.boolFromGroup = boolFromGroup;
            return PartialView();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetValuesForAnAttribute(int intPkAttribute)
        {
            IActionResult aresult = BadRequest("Invalid data");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + $"/Calculation/GetValuesForAnAttribute" +
                $"?intPkAttribute=" + intPkAttribute);

            List<SelectListItem> selectListItems = new List<SelectListItem>();
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    List<AttributeModel> darrvalues = JsonSerializer
                        .Deserialize<List<AttributeModel>>(jsonResponse.objResponse.ToString());

                    jsonResponse.objResponse = selectListItems = darrvalues.Select(value => new SelectListItem()
                    {
                        Value = value.strValue,
                        Text = value.strValue
                    }).OrderByDescending(value => value.Value).ToList();
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task subGetAttributesAndValues(int? intnPkProduct)
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String strResult;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Calculation/GetAttributesAndValues?intPkProduct=" + intnPkProduct);

            List<AttributeModel> darrattr = new List<AttributeModel>();
            if (response.IsSuccessStatusCode)
            {
                strResult = await response.Content.ReadAsStringAsync();

                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrattr = JsonSerializer.Deserialize<List<AttributeModel>>(
                        jsonResponseModel.objResponse.ToString());                   

                }
            }

            ViewBag.darrattr = darrattr;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    }

    //==================================================================================================================
}
/*END-TASK*/
