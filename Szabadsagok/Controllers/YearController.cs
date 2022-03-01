using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Szabadsagok.Controllers
{
    public class YearController : Controller
    {
        [HttpGet]
        public IActionResult GetYear(int year)
        {
            return View();
        }

        [HttpPost]
        public IActionResult SetYearData(List<YearConfig> yearConfig)
        {
            return View();
        }
    }
}
