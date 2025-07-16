using ClientMvc.Models;
using ClientMvc.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ClientMvc.Controllers
{
    // Controlador para gestionar distritos siguiendo el patrón MVC
    public class DistrictController : Controller
    {
        private readonly ApiService _apiService;
        private readonly ILogger<DistrictController> _logger;

        public DistrictController(ApiService apiService, ILogger<DistrictController> logger)
        {
            _apiService = apiService;
            _logger = logger;
        }

        // GET: District - Mostrar lista de distritos con paginación y filtros
        public async Task<IActionResult> Index(string searchTerm = "", int? municipalityId = null, bool? isActive = null, int page = 1, int pageSize = 5)
        {
            try
            {
                // Obtener distritos y municipios de la API
                var districts = await _apiService.GetDistrictsAsync();
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                
                // Aplicar filtros
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    districts = districts.Where(d => 
                        d.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                        d.Code.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();
                }
                
                if (municipalityId.HasValue)
                {
                    districts = districts.Where(d => d.MunicipalityId == municipalityId.Value).ToList();
                }
                
                if (isActive.HasValue)
                {
                    districts = districts.Where(d => d.IsActive == isActive.Value).ToList();
                }
                
                // Crear resultado paginado
                var paginatedResult = new PaginatedResult<District>(districts, page, pageSize);
                
                // Preparar datos para la vista
                ViewBag.SearchTerm = searchTerm;
                ViewBag.MunicipalityId = municipalityId;
                ViewBag.IsActive = isActive;
                ViewBag.CurrentPage = page;
                ViewBag.PageSize = pageSize;
                
                // Crear lista de municipios para el filtro
                ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", municipalityId);
                
                return View(paginatedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar distritos");
                TempData["ErrorMessage"] = "Error al cargar los distritos. Intente nuevamente.";
                return View(new PaginatedResult<District>(new List<District>(), 1, pageSize));
            }
        }

        // GET: District/Details/5 - Mostrar detalles de un distrito específico
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var district = await _apiService.GetDistrictByIdAsync(id);
                
                if (district == null)
                {
                    TempData["ErrorMessage"] = "Distrito no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                return View(district);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener distrito {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener los detalles del distrito.";
                return RedirectToAction(nameof(Index));
            }
        }

        // GET: District/Create - Mostrar formulario para crear nuevo distrito
        public async Task<IActionResult> Create()
        {
            try
            {
                // Cargar lista de municipios para el select
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name");
                
                return View(new District());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar municipios para crear distrito");
                TempData["ErrorMessage"] = "Error al cargar los municipios.";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: District/Create - Procesar creación de nuevo distrito
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(District district)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    // Recargar municipios si hay errores de validación
                    var municipalities = await _apiService.GetMunicipalitiesAsync();
                    ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                    return View(district);
                }
                
                var success = await _apiService.CreateDistrictAsync(district);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Distrito creado exitosamente.";
                    return RedirectToAction(nameof(Index));
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al crear el distrito. Intente nuevamente.";
                    var municipalities = await _apiService.GetMunicipalitiesAsync();
                    ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                    return View(district);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear distrito");
                TempData["ErrorMessage"] = "Error interno del servidor.";
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                return View(district);
            }
        }

        // GET: District/Edit/5 - Mostrar formulario para editar distrito
        public async Task<IActionResult> Edit(int id)
        {
            try
            {
                var district = await _apiService.GetDistrictByIdAsync(id);
                
                if (district == null)
                {
                    TempData["ErrorMessage"] = "Distrito no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                // Cargar lista de municipios para el select
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                
                return View(district);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener distrito para editar {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener el distrito para editar.";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: District/Edit/5 - Procesar actualización de distrito
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, District district)
        {
            if (id != district.Id)
            {
                TempData["ErrorMessage"] = "ID de distrito no coincide.";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                if (!ModelState.IsValid)
                {
                    var municipalities = await _apiService.GetMunicipalitiesAsync();
                    ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                    return View(district);
                }
                
                var success = await _apiService.UpdateDistrictAsync(district);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Distrito actualizado exitosamente.";
                    return RedirectToAction(nameof(Index));
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al actualizar el distrito.";
                    var municipalities = await _apiService.GetMunicipalitiesAsync();
                    ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                    return View(district);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar distrito {Id}", id);
                TempData["ErrorMessage"] = "Error interno del servidor.";
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                ViewBag.Municipalities = new SelectList(municipalities, "Id", "Name", district.MunicipalityId);
                return View(district);
            }
        }

        // GET: District/Delete/5 - Mostrar confirmación para eliminar distrito
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var district = await _apiService.GetDistrictByIdAsync(id);
                
                if (district == null)
                {
                    TempData["ErrorMessage"] = "Distrito no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                return View(district);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener distrito para eliminar {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener el distrito.";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: District/Delete/5 - Procesar eliminación de distrito
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var success = await _apiService.DeleteDistrictAsync(id);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Distrito eliminado exitosamente.";
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al eliminar el distrito.";
                }
                
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar distrito {Id}", id);
                TempData["ErrorMessage"] = "Error interno del servidor.";
                return RedirectToAction(nameof(Index));
            }
        }
    }
}