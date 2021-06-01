/*TASK RP. WORKFLOW BASE*/
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
//                                                          //CO-AUTHOR: Towa (DPG - Daniel Peña).
//                                                          //DATE: October 23, 2020.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class PrintshopWorkflowsController : BaseController
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public PrintshopWorkflowsController(AppSessionContext requestHandler, IConfiguration configuration) :
            base(requestHandler, configuration)
        {
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> Index()
        {
            List<WorkflowBaseModel> darrwfbase = await darrGetBaseAllWorkflows();

            return View(darrwfbase);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetBase()
        {
            List<WorkflowBaseModel> darrwfbase = await darrGetBaseAllWorkflows();

            return PartialView("WorkflowTablePartialView", darrwfbase);
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> GetGenerics()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Workflow/GetGenerics");

            JsonResponseModel jsonResponseModel = new JsonResponseModel(200, null, null, null, false, null, false,
                null, null);
            List<WorkflowBaseModel> darrwfbase = new List<WorkflowBaseModel>();
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
                    darrwfbase = JsonSerializer
                        .Deserialize<List<WorkflowBaseModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            ViewBag.boolGeneric = true;
            return PartialView("WorkflowTablePartialView", darrwfbase);
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private async Task<List<WorkflowBaseModel>> darrGetBaseAllWorkflows()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") + "/Workflow/GetAllBase");

            List<WorkflowBaseModel> darrwfbase = new List<WorkflowBaseModel>();
            if (
                response.IsSuccessStatusCode
                )
            {
                String strResponse = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponseModel = JsonSerializer.Deserialize<JsonResponseModel>(strResponse);

                if (
                    jsonResponseModel.intStatus == 200
                    )
                {
                    darrwfbase = JsonSerializer
                        .Deserialize<List<WorkflowBaseModel>>(jsonResponseModel.objResponse.ToString());
                }
            }

            return darrwfbase;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
