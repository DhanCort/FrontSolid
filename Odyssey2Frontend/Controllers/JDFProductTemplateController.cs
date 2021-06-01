/*TASK RP. PRODUCT TEMPLATE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
//                                                          //DATE: November 22, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JDFProductTemplateController : Controller
    {
        //-------------------------------------------------------------------------------------------------------------
        /*STATIC VARIABLES*/

        private IConfiguration configuration;
        static HttpClient client = new HttpClient();

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public JDFProductTemplateController(IConfiguration iConfiguration)
        {
            configuration = iConfiguration;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;

            //                                          //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/ProductTemplate/GetXJDFProductTemplates");

            List<TemplateModel> darrstrCustomTemplateId = new List<TemplateModel>();
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

            return View(darrstrCustomTemplateId);
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public ActionResult Create()
        {
            //                                              //Return the view of create a new XJDF Product template.
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Create(TemplateModel proccessTemplate)
        {
            ActionResult aresult;
            try
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                //                                          //Serialize the data.
                HttpContent content = new StringContent(JsonSerializer
                    .Serialize(proccessTemplate), Encoding.UTF8, "application/json");

                //                                          //Send a POST request.
                HttpResponseMessage response = await client
                    .PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                    + "/ProductTemplate/AddXJDFProductTemplate", content);

                //                                          //Get the status of the response.
                HttpStatusCode status = response.StatusCode;

                //                                          //Get the response.
                String strResponse = await response.Content.ReadAsStringAsync();

                //                                          //Redirect to the index.
                aresult = RedirectToAction(nameof(Index));
            }
            catch
            {
                aresult = View();
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult> Attribute(int intPk)
        {
            ViewBag.intPk = intPk;

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") +
                "/AttributeTemplate/GetFromTemplate/" + intPk);

            List<JDFAttributeModel> darrAttributes = new List<JDFAttributeModel>();
            if (
                //                                          //Verify if the status code is success (ok - 200)

                //                                          //Receive a bool that indicates if the request was
                //                                          //      success.
                response.IsSuccessStatusCode
                )
            {
                //                                          //Get the response of the request.
                result = await response.Content.ReadAsStringAsync();

                //                                          //Deserialize the response.
                darrAttributes = JsonSerializer.Deserialize<List<JDFAttributeModel>>(result);
            }
            ViewBag.SharedAttributes = await GetSharedAttributesForXJDF();
            ViewBag.darrAttributes = darrAttributes;
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> AddAttributeToProductTemplate(JDFAttributeModel attributeModel)
        {
            attributeModel.boolIsGeneral = true;
            ActionResult aresult = BadRequest(ModelState);
            try
            {
                if (
                    //                                      //Validate if the model state is valid.

                    //                                      //Get the model binding.
                    ModelState.IsValid
                    )
                {
                    if (
                        !string.IsNullOrEmpty(attributeModel.strCustomName) &&
                        !string.IsNullOrEmpty(attributeModel.strCardinality) &&
                        !string.IsNullOrEmpty(attributeModel.strDatatype) &&
                        !string.IsNullOrEmpty(attributeModel.strDescription)
                        )
                    {

                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept
                            .Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        //                                      //Serialize the data.
                        HttpContent content = new StringContent(JsonSerializer
                            .Serialize(attributeModel), Encoding.UTF8, "application/json");

                        //                                      //Send a POST request.
                        HttpResponseMessage response = await client
                            .PostAsync(
                            configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                            + "/AttributeTemplate/AddNewToXJDFTemplate", content);

                        //                                      //Get the status of the request.
                        HttpStatusCode status = response.StatusCode;

                        //                                      //Get the response of the request.
                        String strResponse = await response.Content.ReadAsStringAsync();
                    }

                    if (
                        attributeModel.arrintAttributePk != null
                        )
                    {
                        await AddSharedAttributeToProcessTemplate(attributeModel.arrintAttributePk, 
                            attributeModel.intTemplatePk);
                    }

                    //                                      //Redirect to the action attribute.
                    aresult = RedirectToAction("Attribute", new
                    {
                        intPk = attributeModel.intTemplatePk
                    });
                }
            }
            catch
            {
                aresult = View();
            }

            return aresult;
        }

        //--------------------------------------------------------------------------------------------------------------
        public async Task<List<JDFAttributeModel>> GetSharedAttributesForXJDF(
            //                                              //When the page is loading, execute this function to 
            //                                              //      retrieve all templates form DB
            )
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            String result = null;
            //                                              //Send a GET request.
            HttpResponseMessage response = await client.GetAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/ProductTemplate/GetSharedAttributesForXJDF");

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
            HttpContent content = new StringContent(JsonSerializer.Serialize(sharedAttributes), Encoding.UTF8, 
                "application/json");

            HttpResponseMessage response = await client.PostAsync(
                configuration.GetValue<String>("Odyssey2Settings:serviceAddress") 
                + "/AttributeTemplate/AddSharedAttributesToTemplate", content);

            HttpStatusCode status = response.StatusCode;

            String strResponse = await response.Content.ReadAsStringAsync();
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
