/*TASK RP. STATEMENT*/
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
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: Jan 05, 2021.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JobNotesController : BaseController
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/


        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public JobNotesController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index(int intJobId, int intPkWorkflow)
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                + "/Job/GetNotes?intJobId=" + intJobId + "&intPkWorkflow=" + intPkWorkflow);

            JsonResponseModel jsonResponse = new JsonResponseModel();
            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();
                jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (jsonResponse.intStatus == 200)
                {
                    if (jsonResponse.objResponse != null)
                    {
                        jsonResponse.objResponse = JsonSerializer.Deserialize<JobProcessNotesModel>(
                            jsonResponse.objResponse.ToString());
                        //jsonResponse.objResponse = JsonSerializer.Deserialize<JobNotesModel>(
                        //"{\"intPkNote\":1,\"strWisnetNote\":\"Wisnet note\",\"strOdyssey2Note\":\"Odyssey 2 Note\"}");
                    }
                    else
                    {
                        jsonResponse.objResponse = new JobProcessNotesModel()
                        {
                            intnPkNote = null,
                            strWisnetNote = "",
                            strOdyssey2Note = ""
                        };
                    }

                    ViewBag.intJobId = intJobId;
                    ViewBag.intPkWorkflow = intPkWorkflow;

                    aresult = PartialView("JobNotesPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> SetNote
        (
            int? intnPkNote,
            int intJobId,
            String strOdyssey2Note,
            int intPkWorkflow
        )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intnPkNote = intnPkNote,
                intJobId = intJobId,
                strOdyssey2Note = strOdyssey2Note
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/SetNote", content);

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
                    aresult = await Index(intJobId, intPkWorkflow);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetProcessNotes(
            String strJobId,
            int? intnPkPeriod,
            int? intnPkProcessInWorkflow,
            bool boolFromMyEmployees,
            bool boolFromWfJobs
            )
        {
            IActionResult aresult = base.BadRequest("Invalid data.");

            HttpResponseMessage response = await client.GetAsync(configuration.GetValue<String>(
                "Odyssey2Settings:serviceAddress") + "/Job/GetProcessNotes?intnPkPeriod=" + intnPkPeriod
                + "&intnPkProcessInWorkflow=" + intnPkProcessInWorkflow + "&intJobId=" + Convert.ToInt32(strJobId));

            if (
                response.IsSuccessStatusCode
                )
            {
                String result = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(result);

                if (
                    jsonResponse.intStatus == 200
                    )
                {
                    if (
                        jsonResponse.objResponse != null
                        )
                    {
                        jsonResponse.objResponse = JsonSerializer.Deserialize<ProcessNotesModel>(
                            jsonResponse.objResponse.ToString());
                    }
                    else
                    {
                        jsonResponse.objResponse = new ProcessNotesModel()
                        {
                            strProcessName = "",
                            arrnotes = { }
                        };
                    }

                    ViewBag.intPkPeriod = intnPkPeriod;
                    ViewBag.boolFromMyEmployees = boolFromMyEmployees;
                    ViewBag.boolFromWfJobs = boolFromWfJobs;
                    ViewBag.intnPkProcessInWorkflow = intnPkProcessInWorkflow;
                    ViewBag.strJobId = strJobId;

                    aresult = PartialView("TaskNotesPartialView", jsonResponse.objResponse);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetEmployees(String strEmployee, bool boolGetSuggested)
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

                    if (boolGetSuggested)
                    {
                        if (string.IsNullOrEmpty(strEmployee))
                        {
                            jsonResponse.objResponse = printshopSupervisorEmployeeModel;
                        }
                        else
                        {
                            printshopSupervisorEmployeeModel.arrEmployee = printshopSupervisorEmployeeModel.arrEmployee
                                .Where(w => String.Format("{0}_{1}", w.strFirstName.Replace(" ", "_"), w.strLastName.Replace(" ", "_"))
                                .Contains(strEmployee))
                                .ToList();

                            jsonResponse.objResponse = printshopSupervisorEmployeeModel;
                        }

                        aresult = PartialView("SuggestedEmployeesPartialView", jsonResponse.objResponse);
                    }
                    else
                    {
                        if (string.IsNullOrEmpty(strEmployee))
                        {
                            jsonResponse.objResponse = printshopSupervisorEmployeeModel;
                        }
                        else
                        {
                            PrintshopEmployeeModel employee = printshopSupervisorEmployeeModel.arrEmployee
                                .FirstOrDefault(w => String.Format("{0}_{1}", w.strFirstName.Replace(" ", "_"), w.strLastName.Replace(" ", "_"))
                                .Contains(strEmployee));

                            jsonResponse.objResponse = employee;

                            aresult = Ok(jsonResponse);
                        }
                    }
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> AddProcessNotes(
            int intPkProcessInWorkflow,
            String strNote,
            List<int> arrContactsIds,
            int intJobId,
            bool boolFromMyEmployees,
            bool boolFromWfJobs
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            Object obj = new
            {
                intPkProcessInWorkflow = intPkProcessInWorkflow,
                strNote = strNote,
                arrContactsIds = arrContactsIds,
                intJobId = intJobId
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/AddProcessNotes", content);

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
                    aresult = await GetProcessNotes(intJobId.ToString(), null,
                        intPkProcessInWorkflow, boolFromMyEmployees, boolFromWfJobs);
                }
            }

            return aresult;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> DeleteNote(
            int intPkNote,
            int intPkProcessInWorkflow,
            int intJobId,
            bool boolFromMyEmployees,
            bool boolFromWfJobs
            )
        {
            IActionResult aresult = BadRequest("Invalid data.");

            Object obj = new
            {
                intPkNote = intPkNote
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(obj),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Job/DeleteProcessNote", content);

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
                    aresult = await GetProcessNotes(intJobId.ToString(), null,
                                intPkProcessInWorkflow, boolFromMyEmployees, boolFromWfJobs);
                }
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
    }
    //==================================================================================================================
}
/*END-TASK*/
