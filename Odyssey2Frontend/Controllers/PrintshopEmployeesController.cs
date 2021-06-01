/*TASK RP. EPLOYEE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using Odyssey2Frontend.Models;
using System.Text.Json;
using System.Text;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Jun 19, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopEmployeesController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopEmployeesController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index(String strEmployee)
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
                PrintshopSupervisorEmployeeModel darrSupEmp = new PrintshopSupervisorEmployeeModel();

                if (jsonResponse.intStatus == 200)
                {
                    darrSupEmp = JsonSerializer.Deserialize<PrintshopSupervisorEmployeeModel>(
                        jsonResponse.objResponse.ToString());

                    //jsonResponse.objResponse = JsonSerializer.Deserialize<List<PrintshopSupervisorEmployeeModel>>(
                    //    jsonResponse.objResponse.ToString());
                    jsonResponse.objResponse = JsonSerializer.Deserialize<PrintshopSupervisorEmployeeModel>(
                        jsonResponse.objResponse.ToString());

                    if (strEmployee == null)
                    {
                        aresult = View(jsonResponse.objResponse);
                    }
                    else
                    {
                        List<PrintshopEmployeeModel> printshopEmployee = new List<PrintshopEmployeeModel>();
                        printshopEmployee = darrSupEmp.arrEmployee
                            .Where(w =>
                                w.strFirstName.Any(a => w.strFirstName.ToLower().Contains(strEmployee.ToLower())) ||
                                w.strLastName.Any(a => w.strLastName.ToLower().Contains(strEmployee.ToLower()))
                            ).ToList();

                        darrSupEmp = new PrintshopSupervisorEmployeeModel()
                        {
                            arrEmployee = printshopEmployee
                        };

                        aresult = View(darrSupEmp);
                    }

                    ViewBag.strSearch = strEmployee;
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetOverdueTasks(
            int? intnContactId
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/employee/GetOverdueTasks?intnContactId=" + intnContactId);

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
                        .Deserialize<List<OverdueTaskModel>>(jsonResponse.objResponse.ToString());

                    ViewBag.intnContactId = intnContactId;
                    aresult = PartialView("EmployeeOverdueTasksPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetAllTasks(
            int? intnContactId
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/employee/GetAllTasks?intnContactId=" + intnContactId);

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
                    List<PerPeriodModel> darrperperiod = JsonSerializer
                        .Deserialize<List<PerPeriodModel>>(jsonResponse.objResponse.ToString());

                    ViewBag.intnContactId = intnContactId;
                    aresult = PartialView("EmployeePeriodsPartialView", darrperperiod);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEmployeeCalendar(String strDay, bool boolIsMain, int? intnContactId)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/employee/GetDay?strDay=" + strDay + "&intnContactId=" + intnContactId);

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
                    WeekPeriodsModel weekperiod = JsonSerializer.Deserialize<WeekPeriodsModel>(jsonResponse.objResponse.ToString());

                    ViewBag.intnContactId = intnContactId;
                    if (boolIsMain)
                    {
                        aresult = PartialView("EmployeeMainCalendarPartialView", weekperiod);
                    }
                    else
                    {
                        aresult = PartialView("EmployeePeriodsPartialView", weekperiod.arrperortask);
                    }
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetFinalStart(ResPerResourcePerdiodModel resper)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resper),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Employee/SetFinalStart", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonres.intStatus == 200 &&
                    jsonres.objResponse != null
                    )
                {
                    jsonres.objResponse = ((JsonElement)jsonres.objResponse).GetBoolean();
                }
                else { 
                    jsonres.objResponse = false;
                }

                aresult = base.Ok(jsonres);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetFinalEnd(ResPerResourcePerdiodModel resper)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(resper),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Employee/SetFinalEnd", content);

            if (
                response.IsSuccessStatusCode
                )
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonres = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                if (
                    jsonres.intStatus == 200 &&
                    jsonres.objResponse != null
                    )
                {
                    jsonres.objResponse = ((JsonElement)jsonres.objResponse).GetBoolean();
                }
                else
                {
                    jsonres.objResponse = false;
                }

                aresult = base.Ok(jsonres);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> SetTask(TaskModel task)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(task),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Employee/SetTask", content);

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
        public async Task<IActionResult> GetTask(int intPkTask)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/employee/GetTask?intPkTask=" + intPkTask);

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
                    jsonResponse.objResponse = JsonSerializer.Deserialize<TaskModel>(jsonResponse.objResponse.ToString());
                }

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeleteTask(int intnPkTask)
        {
            var task = new { intnPkTask = intnPkTask };
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(task),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/employee/DeleteTask", content);

            String result = null;
            JsonResponseModel jsonResponse = new JsonResponseModel();

            if (response.IsSuccessStatusCode)
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> CompleteTask(int intnPkTask)
        {
            var task = new { intnPkTask = intnPkTask };
            IActionResult aresult = Ok();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(task),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/employee/CompleteTask", content);

            String result = null;
            JsonResponseModel jsonResponse = new JsonResponseModel();

            if (response.IsSuccessStatusCode)
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                aresult = Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetRole(
            int intContactId,
            bool? boolnIsSupervisor,
            bool? boolnIsAccountant
            )
        {
            var data = new
            {
                intContactId = intContactId,
                boolnIsSupervisor = boolnIsSupervisor,
                boolnIsAccountant = boolnIsAccountant
            };
            IActionResult aresult = base.BadRequest();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(data),
                Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/employee/SetRole", content);

            String result = null;
            JsonResponseModel jsonResponse = new JsonResponseModel();

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    intContactId == this.sesmodSession.intContactId &&
                    boolnIsAccountant != null
                    )
                {
                    this.sesmodSession.boolIsAccountant = (bool)boolnIsAccountant;
                    this.subSetAllSessionProperties();
                }

                aresult = Ok(jsonResponse);
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
