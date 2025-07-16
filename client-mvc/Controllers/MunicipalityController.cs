using ClientMvc.Models;
using ClientMvc.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClientMvc.Controllers
{
    // Controlador para gestionar municipios siguiendo el patrón MVC
    public class MunicipalityController : Controller
    {
        private readonly ApiService _apiService;
        private readonly ILogger<MunicipalityController> _logger;

        public MunicipalityController(ApiService apiService, ILogger<MunicipalityController> logger)
        {
            _apiService = apiService;
            _logger = logger;
        }

        // GET: Municipality - Mostrar lista de municipios con paginación y filtros
        public async Task<IActionResult> Index(string searchTerm = "", bool? isActive = null, int page = 1, int pageSize = 5)
        {
            try
            {
                // Obtener todos los municipios de la API
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                
                // Aplicar filtros
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    municipalities = municipalities.Where(m => 
                        m.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                        m.Code.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();
                }
                
                if (isActive.HasValue)
                {
                    municipalities = municipalities.Where(m => m.IsActive == isActive.Value).ToList();
                }
                
                // Crear resultado paginado
                var paginatedResult = new PaginatedResult<Municipality>(municipalities, page, pageSize);
                
                // Pasar datos a la vista
                ViewBag.SearchTerm = searchTerm;
                ViewBag.IsActive = isActive;
                ViewBag.CurrentPage = page;
                ViewBag.PageSize = pageSize;
                
                return View(paginatedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar municipios");
                TempData["ErrorMessage"] = "Error al cargar los municipios. Intente nuevamente.";
                return View(new PaginatedResult<Municipality>(new List<Municipality>(), 1, pageSize));
            }
        }

        // GET: Municipality/Details/5 - Mostrar detalles de un municipio específico
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var municipality = await _apiService.GetMunicipalityByIdAsync(id);
                
                if (municipality == null)
                {
                    TempData["ErrorMessage"] = "Municipio no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                return View(municipality);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener municipio {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener los detalles del municipio.";
                return RedirectToAction(nameof(Index));
            }
        }

        // GET: Municipality/Create - Mostrar formulario para crear nuevo municipio
        public IActionResult Create()
        {
            return View(new Municipality());
        }

        // POST: Municipality/Create - Procesar creación de nuevo municipio
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Municipality municipality)
        {
            try
            {
                // Validar el modelo
                if (!ModelState.IsValid)
                {
                    return View(municipality);
                }
                
                // Crear municipio a través de la API
                var success = await _apiService.CreateMunicipalityAsync(municipality);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Municipio creado exitosamente.";
                    return RedirectToAction(nameof(Index));
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al crear el municipio. Intente nuevamente.";
                    return View(municipality);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear municipio");
                TempData["ErrorMessage"] = "Error interno del servidor.";
                return View(municipality);
            }
        }

        // GET: Municipality/Edit/5 - Mostrar formulario para editar municipio
        public async Task<IActionResult> Edit(int id)
        {
            try
            {
                var municipality = await _apiService.GetMunicipalityByIdAsync(id);
                
                if (municipality == null)
                {
                    TempData["ErrorMessage"] = "Municipio no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                return View(municipality);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener municipio para editar {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener el municipio para editar.";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Municipality/Edit/5 - Procesar actualización de municipio
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Municipality municipality)
        {
            if (id != municipality.Id)
            {
                TempData["ErrorMessage"] = "ID de municipio no coincide.";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                if (!ModelState.IsValid)
                {
                    return View(municipality);
                }
                
                var success = await _apiService.UpdateMunicipalityAsync(municipality);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Municipio actualizado exitosamente.";
                    return RedirectToAction(nameof(Index));
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al actualizar el municipio.";
                    return View(municipality);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar municipio {Id}", id);
                TempData["ErrorMessage"] = "Error interno del servidor.";
                return View(municipality);
            }
        }

        // GET: Municipality/Delete/5 - Mostrar confirmación para eliminar municipio
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var municipality = await _apiService.GetMunicipalityByIdAsync(id);
                
                if (municipality == null)
                {
                    TempData["ErrorMessage"] = "Municipio no encontrado.";
                    return RedirectToAction(nameof(Index));
                }
                
                return View(municipality);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener municipio para eliminar {Id}", id);
                TempData["ErrorMessage"] = "Error al obtener el municipio.";
                return RedirectToAction(nameof(Index));
            }
        }

        // POST: Municipality/Delete/5 - Procesar eliminación de municipio
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var success = await _apiService.DeleteMunicipalityAsync(id);
                
                if (success)
                {
                    TempData["SuccessMessage"] = "Municipio eliminado exitosamente.";
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al eliminar el municipio.";
                }
                
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar municipio {Id}", id);
                TempData["ErrorMessage"] = "Error interno del servidor.";
                return RedirectToAction(nameof(Index));
            }
        }
    }
}