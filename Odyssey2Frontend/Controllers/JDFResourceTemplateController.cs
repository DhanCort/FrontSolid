using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Odyssey2Frontend.Controllers
{
    public class JDFResourceTemplateController : Controller
    {
        // GET: JDFResourceTemplate
        public ActionResult Index()
        {
            return View();
        }

        // GET: JDFResourceTemplate/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: JDFResourceTemplate/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: JDFResourceTemplate/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(IFormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: JDFResourceTemplate/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: JDFResourceTemplate/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, IFormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: JDFResourceTemplate/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: JDFResourceTemplate/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(int id, IFormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
    }
}