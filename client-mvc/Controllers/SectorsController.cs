using DenounceBeasts.WebClient.Models.Domain;
using DenounceBeasts.WebClient.Models.ViewModels;
using DenounceBeasts.WebClient.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace DenounceBeasts.WebClient.Controllers;

[Authorize]
public class SectorsController : Controller
{
    private readonly ISectorService _sectorService;
    private readonly IMunicipalityService _municipalityService;
    private readonly ILogger<SectorsController> _logger;

    public SectorsController(
        ISectorService sectorService,
        IMunicipalityService municipalityService,
        ILogger<SectorsController> logger)
    {
        _sectorService = sectorService;
        _municipalityService = municipalityService;
        _logger = logger;
    }

    // GET: Sectors
    public async Task<IActionResult> Index(string? search, int? municipalityId)
    {
        try
        {
            var sectors = await _sectorService.SearchAsync(search, municipalityId);
            var municipalities = await _municipalityService.GetAllAsync();

            var viewModel = new SectorListViewModel
            {
                Sectors = sectors,
                Municipalities = municipalities.Select(m => new SelectListItem
                {
                    Value = m.Id.ToString(),
                    Text = m.Name,
                    Selected = m.Id == municipalityId
                }),
                SearchQuery = search,
                MunicipalityFilter = municipalityId,
                TotalCount = sectors.Count(),
                ActiveCount = sectors.Count(s => s.IsActive),
                InactiveCount = sectors.Count(s => !s.IsActive)
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sectors");
            TempData["ErrorMessage"] = "Error al cargar los sectores";
            return View(new SectorListViewModel());
        }
    }

    // GET: Sectors/Details/5
    public async Task<IActionResult> Details(int id)
    {
        try
        {
            var sector = await _sectorService.GetByIdAsync(id);
            if (sector == null)
            {
                return NotFound();
            }

            var municipality = await _municipalityService.GetByIdAsync(sector.MunicipalityId);

            var viewModel = new SectorDetailsViewModel
            {
                Sector = sector,
                Municipality = municipality ?? new Municipality(),
                ComplaintsCount = sector.ComplaintsCount
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sector details for ID {Id}", id);
            return NotFound();
        }
    }

    // GET: Sectors/Create
    public async Task<IActionResult> Create(int? municipalityId)
    {
        try
        {
            var municipalities = await _municipalityService.GetActiveAsync();

            var viewModel = new SectorCreateViewModel
            {
                MunicipalityId = municipalityId ?? 0,
                Municipalities = municipalities.Select(m => new SelectListItem
                {
                    Value = m.Id.ToString(),
                    Text = m.Name,
                    Selected = m.Id == municipalityId
                })
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading create sector form");
            return View(new SectorCreateViewModel());
        }
    }

    // POST: Sectors/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(SectorCreateViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            await PopulateMunicipalities(viewModel);
            return View(viewModel);
        }

        try
        {
            // Check if code is unique within municipality
            var isCodeUnique = await _sectorService.IsCodeUniqueInMunicipalityAsync(
                viewModel.Code, viewModel.MunicipalityId);
            
            if (!isCodeUnique)
            {
                ModelState.AddModelError(nameof(viewModel.Code), 
                    "El código ya existe en este municipio");
                await PopulateMunicipalities(viewModel);
                return View(viewModel);
            }

            var sector = new Sector
            {
                Name = viewModel.Name,
                Code = viewModel.Code.ToUpper(),
                MunicipalityId = viewModel.MunicipalityId,
                IsActive = viewModel.IsActive
            };

            var result = await _sectorService.CreateAsync(sector);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Sector creado exitosamente";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                TempData["ErrorMessage"] = "Error al crear el sector";
                await PopulateMunicipalities(viewModel);
                return View(viewModel);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sector");
            TempData["ErrorMessage"] = "Error al crear el sector";
            await PopulateMunicipalities(viewModel);
            return View(viewModel);
        }
    }

    // GET: Sectors/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        try
        {
            var sector = await _sectorService.GetByIdAsync(id);
            if (sector == null)
            {
                return NotFound();
            }

            var municipalities = await _municipalityService.GetActiveAsync();

            var viewModel = new SectorEditViewModel
            {
                Id = sector.Id,
                Name = sector.Name,
                Code = sector.Code,
                MunicipalityId = sector.MunicipalityId,
                IsActive = sector.IsActive,
                CreatedAt = sector.CreatedAt,
                UpdatedAt = sector.UpdatedAt,
                MunicipalityName = sector.MunicipalityName,
                ComplaintsCount = sector.ComplaintsCount,
                Municipalities = municipalities.Select(m => new SelectListItem
                {
                    Value = m.Id.ToString(),
                    Text = m.Name,
                    Selected = m.Id == sector.MunicipalityId
                })
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sector for edit, ID {Id}", id);
            return NotFound();
        }
    }

    // POST: Sectors/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, SectorEditViewModel viewModel)
    {
        if (id != viewModel.Id)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            await PopulateMunicipalities(viewModel);
            return View(viewModel);
        }

        try
        {
            // Check if code is unique within municipality (excluding current sector)
            var isCodeUnique = await _sectorService.IsCodeUniqueInMunicipalityAsync(
                viewModel.Code, viewModel.MunicipalityId, id);
            
            if (!isCodeUnique)
            {
                ModelState.AddModelError(nameof(viewModel.Code), 
                    "El código ya existe en este municipio");
                await PopulateMunicipalities(viewModel);
                return View(viewModel);
            }

            var sector = new Sector
            {
                Id = viewModel.Id,
                Name = viewModel.Name,
                Code = viewModel.Code.ToUpper(),
                MunicipalityId = viewModel.MunicipalityId,
                IsActive = viewModel.IsActive
            };

            var result = await _sectorService.UpdateAsync(id, sector);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Sector actualizado exitosamente";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                TempData["ErrorMessage"] = "Error al actualizar el sector";
                await PopulateMunicipalities(viewModel);
                return View(viewModel);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sector {Id}", id);
            TempData["ErrorMessage"] = "Error al actualizar el sector";
            await PopulateMunicipalities(viewModel);
            return View(viewModel);
        }
    }

    // GET: Sectors/Delete/5
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var sector = await _sectorService.GetByIdAsync(id);
            if (sector == null)
            {
                return NotFound();
            }

            return View(sector);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading sector for delete, ID {Id}", id);
            return NotFound();
        }
    }

    // POST: Sectors/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var result = await _sectorService.DeleteAsync(id);
            if (result)
            {
                TempData["SuccessMessage"] = "Sector eliminado exitosamente";
            }
            else
            {
                TempData["ErrorMessage"] = "Error al eliminar el sector";
            }

            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting sector {Id}", id);
            TempData["ErrorMessage"] = "Error al eliminar el sector";
            return RedirectToAction(nameof(Index));
        }
    }

    // AJAX: Get sectors by municipality
    [HttpGet]
    public async Task<IActionResult> GetByMunicipality(int municipalityId)
    {
        try
        {
            var sectors = await _sectorService.GetActiveByMunicipalityAsync(municipalityId);
            var options = sectors.Select(s => new { value = s.Id, text = s.Name });
            return Json(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sectors for municipality {MunicipalityId}", municipalityId);
            return Json(new object[0]);
        }
    }

    // AJAX: Check code uniqueness within municipality
    [HttpGet]
    public async Task<IActionResult> CheckCodeUniqueInMunicipality(string code, int municipalityId, int? excludeId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code) || municipalityId == 0)
            {
                return Json(new { isUnique = true });
            }

            var isUnique = await _sectorService.IsCodeUniqueInMunicipalityAsync(code, municipalityId, excludeId);
            return Json(new { isUnique });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking code uniqueness for {Code} in municipality {MunicipalityId}", 
                code, municipalityId);
            return Json(new { isUnique = false });
        }
    }

    private async Task PopulateMunicipalities(SectorCreateViewModel viewModel)
    {
        try
        {
            var municipalities = await _municipalityService.GetActiveAsync();
            viewModel.Municipalities = municipalities.Select(m => new SelectListItem
            {
                Value = m.Id.ToString(),
                Text = m.Name,
                Selected = m.Id == viewModel.MunicipalityId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error populating municipalities");
            viewModel.Municipalities = new List<SelectListItem>();
        }
    }
}