using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Odyssey2Frontend.Models;

namespace Odyssey2Frontend.Controllers
{
    public class RuleController : BaseController
    {
        public RuleController(AppSessionContext requestHandler, IConfiguration iConfiguration)
            : base(requestHandler, iConfiguration)
        {
        }
        public IActionResult Index()
        {
            return View();
        }
        public async Task<IActionResult> GetRulesList(int? intnPkResource, bool boolIsEmployee, int? intnContactId)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/Resource/GetRules?intnPkResource={intnPkResource}&" +
                    $"boolIsEmployee={boolIsEmployee}&intnContactId={intnContactId}");
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                jsonResponse.objResponse = JsonSerializer.Deserialize<List<RuleModel>>(jsonResponse.objResponse.ToString());

                ViewBag.intnPkResource = intnPkResource;
                ViewBag.boolIsEmployee = boolIsEmployee.ToString().ToLower();
                ViewBag.intnContactId = intnContactId;

                aresult = PartialView("RulesPartialView", jsonResponse.objResponse);
            }
            return aresult;
        }
        public async Task<IActionResult> RuleIsAddable(AddRuleModel rule)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage {
                Method=HttpMethod.Get,
                RequestUri = new Uri(configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/resource/ruleisaddable?rule={rule}"),
                Content = new StringContent(JsonSerializer.Serialize(rule),
                Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);
                if (jsonResponse.intStatus == 200)
                {
                    jsonResponse.objResponse = ((JsonElement)jsonResponse.objResponse).GetBoolean();
                }
                aresult = base.Ok(jsonResponse);
            }
            return aresult;
        }

        public async Task<IActionResult> AddRule(AddRuleModel rule)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(rule),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/resource/addrule", content);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }

        public async Task<IActionResult> DeleteRule(DeleteRuleModel rule)
        {
            IActionResult aresult = BadRequest("Invalid data.");

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(JsonSerializer.Serialize(rule),
                Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync(
                    configuration.GetValue<String>("Odyssey2Settings:serviceAddress")
                    + $"/resource/deleterule", content);
            if (response.IsSuccessStatusCode)
            {
                String strResult = await response.Content.ReadAsStringAsync();
                JsonResponseModel jsonResponse = JsonSerializer.Deserialize<JsonResponseModel>(strResult);

                aresult = base.Ok(jsonResponse);
            }

            return aresult;
        }
    }
}