using ClientMvc.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace ClientMvc.Controllers
{
    // Controlador principal para la página de inicio
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        // Página de inicio - Dashboard con enlaces a las funcionalidades
        public IActionResult Index()
        {
            return View();
        }

        // Página de política de privacidad
        public IActionResult Privacy()
        {
            return View();
        }

        // Página de manejo de errores
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}