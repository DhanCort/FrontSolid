/*TASK RP. CONTACTS*/
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
//                                                          //DATE: Aug 04, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopContactsController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public PrintshopContactsController(AppSessionContext requestHandler, IConfiguration iConfiguration)
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
                + "/customer/GetAllForAPrintshop");

            SelectList selectListCustomers = new SelectList(new List<SelectListItem>());
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

                    aresult = View(jsonResponse);

                    List<PrintshopCustomerModel> darrpscustmodel = (List<PrintshopCustomerModel>)jsonResponse.objResponse;
                    selectListCustomers = new SelectList(darrpscustmodel.Select(
                            s => new SelectListItem
                            {
                                Value = s.intContactId.ToString(),
                                Text = s.strFirstName + s.strLastName
                            }
                        ),
                        "Value", "Text");
                }
            }

            ViewBag.selectListCustomers = selectListCustomers;

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Add(PrintshopCustomerModel printshopCustomer)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(printshopCustomer),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Customer/Add", content);

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
                    jsonResponseModel.objResponse =
                    JsonSerializer.Deserialize<PrintshopCustomerModel>(jsonResponseModel.objResponse.ToString());
                }
                aresult = base.Ok(jsonResponseModel);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAllForAPrintshop()
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

                    aresult = base.Ok(jsonResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
