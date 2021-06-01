/*TASK RP. PROCESS TEMPLATE*/
using System;
using System.Text.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Net;
using Odyssey2Frontend.Models;
using Microsoft.Extensions.Configuration;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 26, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JDFProcessTemplateController : Controller
    {
        //-------------------------------------------------------------------------------------------------------------
        //STATIC VARIABLES

        private IConfiguration configuration;
        static HttpClient client = new HttpClient();

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public JDFProcessTemplateController(IConfiguration iConfiguration)
        {
            configuration = iConfiguration;
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<ActionResult> Index(
            //                                              //When the page is loading, execute this function to 
            //                                              //      retrieve all templates form DB
            )
        {
            List<TemplateModel> darrstrCustomTemplateId = new List<TemplateModel>();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/Type/GetXJDFProcessTemplates");

            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                result = await response.Content.ReadAsStringAsync();

                //                                          //Deserializae the response.
                darrstrCustomTemplateId = JsonSerializer.Deserialize<List<TemplateModel>>(result);
            }

            //                                              //Return list.
            return View(darrstrCustomTemplateId);
        }

        //-------------------------------------------------------------------------------------------------------------
        public async Task<List<JDFAttributeModel>> GetSharedAttributesForXJDF(
            //                                              //When the page is loading, execute this function to 
            //                                              //      retrieve all templates form DB
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            String strResOrPro = "Process";
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/Type/GetSharedAttributesForXJDF?strResOrPro=" + strResOrPro);

            List<JDFAttributeModel> darrXJDFAttribute = new List<JDFAttributeModel>();
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the content of the response.
                result = await response.Content.ReadAsStringAsync();

                //                                          //Deserializae the response.
                darrXJDFAttribute = JsonSerializer.Deserialize<List<JDFAttributeModel>>(result);
            }

            //                                              //Return list.
            return darrXJDFAttribute;
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Create(
            //                                              //When this function is executed, redirect to "Create new
            //                                              //      JDF Process" page.
            )
        {

            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Create(
            //                                              //The user send a model with all template data to the DB
            TemplateModel proccessTemplate
            )
        {
            proccessTemplate.strResOrPro = "Process";
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //                                              //Serialize the input data.
            HttpContent content = new StringContent(JsonSerializer.Serialize(proccessTemplate),
                Encoding.UTF8, "application/json");

            //                                              //Send a POST request.
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/Type/AddNewXJDF", content);

            HttpStatusCode status = response.StatusCode;

            String strResponse = await response.Content.ReadAsStringAsync();

            return RedirectToAction(nameof(Index));
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Edit(
            string strJDFTemplateId
            )
        {
            ViewBag.JDFTemplateId = strJDFTemplateId;
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(
            int id,
            IFormCollection collection
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Delete(
            int id
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(
            int id,
            IFormCollection collection
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> Attribute(int intPk)
        {
            List<JDFAttributeModel> darrAttributes = new List<JDFAttributeModel>();
            List<JDFAttributeModel> darrJDFAttribute = new List<JDFAttributeModel>();

            ViewBag.strJDFTemplateId = intPk;

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/Attribute/GetFromTemplate/" + intPk);

            if (
                response.IsSuccessStatusCode
                )
            {
                result = await response.Content.ReadAsStringAsync();

                darrAttributes = JsonSerializer.Deserialize<List<JDFAttributeModel>>(result);
                darrJDFAttribute = await GetSharedAttributesForXJDF();
            }

            ViewBag.darrAttributes = darrAttributes;
            ViewBag.SharedAttributes = darrJDFAttribute;

            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> AddAttributeToProcessTemplate(JDFAttributeModel jdfAttribute)
        {
            if(
                !string.IsNullOrEmpty(jdfAttribute.strCustomName) &&
                !string.IsNullOrEmpty(jdfAttribute.strCardinality) &&
                !string.IsNullOrEmpty(jdfAttribute.strDatatype) &&
                !string.IsNullOrEmpty(jdfAttribute.strDescription)
                )
            {

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                HttpContent content = new StringContent(JsonSerializer.Serialize(jdfAttribute), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                    + "/Attribute/AddNewToXJDFTemplate", content);

                HttpStatusCode status = response.StatusCode;

                String strResponse = await response.Content.ReadAsStringAsync();
            }

            if (
                jdfAttribute.arrintAttributePk != null
                )
            {
                await AddSharedAttributeToProcessTemplate(jdfAttribute.arrintAttributePk, jdfAttribute.intTemplatePk);
            }

            return RedirectToAction("Attribute", new { intPk = jdfAttribute.intTemplatePk });
        }

        //--------------------------------------------------------------------------------------------------------------
        
        public async Task AddSharedAttributeToProcessTemplate(
            List<int> arrintAttributePk, 
            int intTemplatePk
            )
        {
            var sharedAttributes = new
            {
                intTemplatePk = intTemplatePk,
                arrintAttributePk = arrintAttributePk
            };

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpContent content = new StringContent(JsonSerializer.Serialize(sharedAttributes), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/Attribute/AddSharedAttributesToTemplate", content);

            HttpStatusCode status = response.StatusCode;

            String strResponse = await response.Content.ReadAsStringAsync();
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
