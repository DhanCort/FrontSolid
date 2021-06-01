/*TASK RP. ATTRIBUTE TEMPLATE*/
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 22, 2019.

namespace Odyssey2Frontend.Controllers
{
    //==================================================================================================================
    public class JDFAttributeController : Controller
    {
        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Index(
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Details(
            int id
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Create(
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(
            JDFAttributeModel attribute
            )
        {
            return View();
        }

        //--------------------------------------------------------------------------------------------------------------
        public ActionResult Edit(
            int id
            )
        {
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
    }

    //==================================================================================================================
}
/*END-TASK*/