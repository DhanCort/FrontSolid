using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Odyssey2Frontend.Controllers
{
    public class UnavailableController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
