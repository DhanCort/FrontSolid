/*TASK RP. BASE CONTROLLER*/
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

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December 20, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class BaseController : Controller
    {

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public HttpClient client;
        private readonly AppSessionContext _requestHandler;
        public IConfiguration configuration;
        public String strPrintshopId;
        public SessionModel sesmodSession;

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public BaseController(AppSessionContext requestHandler, IConfiguration configuration)
        {
            this._requestHandler = requestHandler;
            this.configuration = configuration;

            this.sesmodSession = _requestHandler.sessmodGetSessionObject();

            //                                              //Set a new httpClient variable.
            client = new HttpClient();

            if (
                this.sesmodSession != null
                )
            {
                //                                          //Set the variable for the functions.
                this.strPrintshopId = sesmodSession.strPrintshopId;

                //                                          //Set the token for the client config.
                client.DefaultRequestHeaders.Authorization = new
                    AuthenticationHeaderValue("Bearer", this.sesmodSession.strToken);
            }

            ViewBag.strPrintshopId = this.strPrintshopId;
            ViewBag.sesmodSession = sesmodSession;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetPrintshops(String strEmail)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/User/GetPrintshops?strEmail=" + strEmail);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonresp = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonresp.intStatus == 200
                    )
                {
                    jsonresp.objResponse = JsonSerializer
                        .Deserialize<PrintshopUserModel>(jsonresp.objResponse.ToString());
                }

                aresult = base.Ok(jsonresp);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Login(LoginModel log)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(log),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/User/Login", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonresp = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonresp.intStatus == 200
                    )
                {
                    this.sesmodSession = JsonSerializer.Deserialize<SessionModel>(jsonresp.objResponse.ToString());
                    this.subSetAllSessionProperties();
                }

                aresult = base.Ok(jsonresp);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> ChangePrintshop(LoginModel log)
        {
            IActionResult aresult = BadRequest();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (
                this._requestHandler.boolGetBoolIsAdmin()
                )
            {
                HttpContent content = new StringContent(JsonSerializer.Serialize(log),
                Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + "/User/ChangePrintshop", content);

                if (
                    response.IsSuccessStatusCode
                    )
                {
                    String strResponse = await response.Content.ReadAsStringAsync();
                    JsonResponseModel jsonresp = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                    if (
                        jsonresp.intStatus == 200
                        )
                    {
                        this.strPrintshopId = log.strPrintshopId;
                        this.sesmodSession.strToken = ((JsonElement)jsonresp.objResponse)
                            .GetProperty("strToken").GetString();
                        this.sesmodSession.strPrintshopName = ((JsonElement)jsonresp.objResponse)
                            .GetProperty("strPrintshopName").GetString();
                        this.subSetAllSessionProperties();

                        jsonresp.objResponse = null;
                    }

                    aresult = base.Ok(jsonresp);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public IActionResult Logout()
        {
            this._requestHandler.subEndSession();
            client.DefaultRequestHeaders.Authorization = null;

            return base.Ok();
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> ModifySpecialPassword(SpecialPasswordModel specialPassword)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(specialPassword),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Printshop/ModifySpecialPassword", content);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAlerts(
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + $"/Employee/GetAlerts");
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponse.intStatus == 200)
                {
                    //jsonResponse.objResponse = "[{\"strAlertType\":\"Testing for job\",\"strAlertDescription\":\"There is a new job to review.\",\"boolnJob\":true,\"intnJobId\":5091652},{\"strAlertType\":\"Testing for estimate\",\"strAlertDescription\":\"There is a new estimate to review.\",\"boolnJob\":false,\"intnJobId\":5733832},{\"strAlertType\":\"Test for nothing\",\"strAlertDescription\":\"Is a notification for nothing.\",\"boolnJob\":null,\"intnJobId\":null}]";
                    jsonResponse.objResponse = JsonSerializer
                        .Deserialize<List<AlertModel>>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetUnreadNotificationsNumber()
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/Printshop/GetUnreadNotificationsNumber");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();

                int intNotificationsNumber = 0;
                JsonResponseModel jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonres.intStatus == 200
                    )
                {
                    intNotificationsNumber = ((JsonElement)jsonres.objResponse).GetInt32();
                }

                aresult = base.Ok(intNotificationsNumber);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetOffset(int intOffset)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intOffset = intOffset
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Printshop/SetOffset", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (jsonResponse.intStatus == 200)
                {
                    this._requestHandler.subSetBoolOfffset(true);
                }
                //jsonResponse.objResponse = JsonSerializer.Deserialize<List<PrintshopCustomerModel>>(
                //        jsonResponse.objResponse.ToString());

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetTimeZone()
        {
            IActionResult aresult = BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/Printshop/GetTimesZones");

            JsonResponseModel jsonres = new JsonResponseModel(400, "Something is wrong.", null, null, false, null, 
                false, null, null);
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);
                aresult = base.Ok(jsonres);

                if (
                    jsonres.intStatus == 200
                    )
                {
                    jsonres.objResponse = JsonSerializer
                        .Deserialize<List<TimeZoneModel>>(jsonres.objResponse.ToString());
                    aresult = PartialView("~/Views/Shared/TimeZonePartialView.cshtml", jsonres.objResponse);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> UpdateTimeZone(TimeZoneModel timezone)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(timezone),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Printshop/UpdateTimeZone", content);

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
        private async Task GetPrintshopName()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Authorization = new
                    AuthenticationHeaderValue("Bearer", this.sesmodSession.strToken);

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Printshop/GetName");

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonresp = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonresp.intStatus == 200
                    )
                {
                    this.sesmodSession.strPrintshopName = ((JsonElement)jsonresp.objResponse).GetString();
                    this.subSetAllSessionProperties();
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        public void subSetAllSessionProperties()
        {
            this._requestHandler.subSetSessionObject(this.sesmodSession);

            //                                          //Set the values on session for de razor views.
            this._requestHandler.subSetBoolIsAdmin(this.sesmodSession.boolIsAdmin);
            this._requestHandler.subSetBoolIsOwner(this.sesmodSession.boolIsOwner);
            this._requestHandler.subSetBoolIsSuperAdmin(this.sesmodSession.boolIsSuperAdmin);
            this._requestHandler.subSetPrintshopId(this.sesmodSession.strPrintshopId);
            this._requestHandler.subSetPrintshopName(this.sesmodSession.strUserFirstName + " " +
                this.sesmodSession.strUserLastName + " (" + this.sesmodSession.strPrintshopName + ")");
            this._requestHandler.subSetUnreadAlerts(this.sesmodSession.intUnreadAlerts);
            this._requestHandler.subSetContactId(this.sesmodSession.intContactId);
            this._requestHandler.subSetSendAProofUrl(this.sesmodSession.strSendAProofUrl);
            this._requestHandler.subSetBoolIsAccountant(this.sesmodSession.boolIsAccountant);
            this._requestHandler.subSetBoolOfffset(this.sesmodSession.boolOffset);
            this._requestHandler.subSetCustomerUrl(this.sesmodSession.strCustomerUrl);
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
