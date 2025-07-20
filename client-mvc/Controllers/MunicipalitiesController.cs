using DenounceBeasts.WebClient.Models.Domain;
using DenounceBeasts.WebClient.Models.ViewModels;
using DenounceBeasts.WebClient.Services;
using Microsoft.AspNetCore.Mvc;

namespace DenounceBeasts.WebClient.Controllers;

public class MunicipalitiesController : Controller
{
    private readonly IMunicipalityService _municipalityService;
    private readonly ISectorService _sectorService;
    private readonly ILogger<MunicipalitiesController> _logger;

    public MunicipalitiesController(
        IMunicipalityService municipalityService,
        ISectorService sectorService,
        ILogger<MunicipalitiesController> logger)
    {
        _municipalityService = municipalityService;
        _sectorService = sectorService;
        _logger = logger;
    }

    // GET: Municipalities
    public async Task<IActionResult> Index(string? search)
    {
        try
        {
            var municipalities = string.IsNullOrWhiteSpace(search)
                ? await _municipalityService.GetAllAsync()
                : await _municipalityService.SearchAsync(search);

            var viewModel = new MunicipalityListViewModel
            {
                Municipalities = municipalities,
                SearchQuery = search,
                TotalCount = municipalities.Count(),
                ActiveCount = municipalities.Count(m => m.IsActive),
                InactiveCount = municipalities.Count(m => !m.IsActive)
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipalities");
            TempData["ErrorMessage"] = "Error al cargar los municipios";
            return View(new MunicipalityListViewModel());
        }
    }

    // GET: Municipalities/Details/5
    public async Task<IActionResult> Details(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                return NotFound();
            }

            var sectors = await _municipalityService.GetSectorsByMunicipalityAsync(id);

            var viewModel = new MunicipalityDetailsViewModel
            {
                Municipality = municipality,
                Sectors = sectors,
                ActiveSectorsCount = sectors.Count(s => s.IsActive),
                InactiveSectorsCount = sectors.Count(s => !s.IsActive)
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipality details for ID {Id}", id);
            return NotFound();
        }
    }

    // GET: Municipalities/Create
    public IActionResult Create()
    {
        return View(new MunicipalityCreateViewModel());
    }

    // POST: Municipalities/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(MunicipalityCreateViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            return View(viewModel);
        }

        try
        {
            // Check if code is unique
            var isCodeUnique = await _municipalityService.IsCodeUniqueAsync(viewModel.Code);
            if (!isCodeUnique)
            {
                ModelState.AddModelError(nameof(viewModel.Code), "El código ya existe");
                return View(viewModel);
            }

            var municipality = new Municipality
            {
                Name = viewModel.Name,
                Code = viewModel.Code.ToUpper(),
                IsActive = viewModel.IsActive
            };

            var result = await _municipalityService.CreateAsync(municipality);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Municipio creado exitosamente";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                TempData["ErrorMessage"] = "Error al crear el municipio";
                return View(viewModel);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating municipality");
            TempData["ErrorMessage"] = "Error al crear el municipio";
            return View(viewModel);
        }
    }

    // GET: Municipalities/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                return NotFound();
            }

            var viewModel = new MunicipalityEditViewModel
            {
                Id = municipality.Id,
                Name = municipality.Name,
                Code = municipality.Code,
                IsActive = municipality.IsActive,
                CreatedAt = municipality.CreatedAt,
                UpdatedAt = municipality.UpdatedAt,
                SectorsCount = municipality.SectorsCount
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipality for edit, ID {Id}", id);
            return NotFound();
        }
    }

    // POST: Municipalities/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, MunicipalityEditViewModel viewModel)
    {
        if (id != viewModel.Id)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return View(viewModel);
        }

        try
        {
            // Check if code is unique (excluding current municipality)
            var isCodeUnique = await _municipalityService.IsCodeUniqueAsync(viewModel.Code, id);
            if (!isCodeUnique)
            {
                ModelState.AddModelError(nameof(viewModel.Code), "El código ya existe");
                return View(viewModel);
            }

            var municipality = new Municipality
            {
                Id = viewModel.Id,
                Name = viewModel.Name,
                Code = viewModel.Code.ToUpper(),
                IsActive = viewModel.IsActive
            };

            var result = await _municipalityService.UpdateAsync(id, municipality);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Municipio actualizado exitosamente";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                TempData["ErrorMessage"] = "Error al actualizar el municipio";
                return View(viewModel);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating municipality {Id}", id);
            TempData["ErrorMessage"] = "Error al actualizar el municipio";
            return View(viewModel);
        }
    }

    // GET: Municipalities/Delete/5
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                return NotFound();
            }

            // Get sectors to show warning if there are any
            var sectors = await _municipalityService.GetSectorsByMunicipalityAsync(id);
            ViewBag.HasSectors = sectors.Any();
            ViewBag.SectorsCount = sectors.Count();

            return View(municipality);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading municipality for delete, ID {Id}", id);
            return NotFound();
        }
    }

    // POST: Municipalities/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var result = await _municipalityService.DeleteAsync(id);
            if (result)
            {
                TempData["SuccessMessage"] = "Municipio eliminado exitosamente";
            }
            else
            {
                TempData["ErrorMessage"] = "Error al eliminar el municipio";
            }

            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting municipality {Id}", id);
            TempData["ErrorMessage"] = "Error al eliminar el municipio";
            return RedirectToAction(nameof(Index));
        }
    }

    // GET: Municipalities/Sectors/5
    public async Task<IActionResult> Sectors(int id)
    {
        try
        {
            var municipality = await _municipalityService.GetByIdAsync(id);
            if (municipality == null)
            {
                return NotFound();
            }

            var sectors = await _municipalityService.GetSectorsByMunicipalityAsync(id);

            ViewBag.Municipality = municipality;
            return View(sectors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sectors for municipality {Id}", id);
            return NotFound();
        }
    }

    // AJAX: Get municipality options for dropdowns
    [HttpGet]
    public async Task<IActionResult> GetOptions()
    {
        try
        {
            var municipalities = await _municipalityService.GetActiveAsync();
            var options = municipalities.Select(m => new { value = m.Id, text = m.Name });
            return Json(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting municipality options");
            return Json(new object[0]);
        }
    }

    // AJAX: Check code uniqueness
    [HttpGet]
    public async Task<IActionResult> CheckCodeUnique(string code, int? excludeId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return Json(new { isUnique = true });
            }

            var isUnique = await _municipalityService.IsCodeUniqueAsync(code, excludeId);
            return Json(new { isUnique });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking code uniqueness for {Code}", code);
            return Json(new { isUnique = false });
        }
    }
}