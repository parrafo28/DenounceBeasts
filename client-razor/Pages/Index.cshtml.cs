using Microsoft.AspNetCore.Mvc.RazorPages;
using ClientRazor.Services;
using ClientRazor.Models;

namespace ClientRazor.Pages
{
    // PageModel para la página principal (Dashboard)
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly ApiService _apiService;

        public IndexModel(ILogger<IndexModel> logger, ApiService apiService)
        {
            _logger = logger;
            _apiService = apiService;
        }

        // Propiedades para mostrar estadísticas en el dashboard
        public int TotalMunicipalities { get; set; }
        public int TotalDistricts { get; set; }
        public int ActiveMunicipalities { get; set; }
        public int ActiveDistricts { get; set; }

        // Método que se ejecuta cuando se accede a la página
        public async Task OnGetAsync()
        {
            try
            {
                _logger.LogInformation("Cargando dashboard - obteniendo estadísticas");
                
                // Obtener datos de municipios y distritos para estadísticas
                var municipalities = await _apiService.GetMunicipalitiesAsync();
                var districts = await _apiService.GetDistrictsAsync();
                
                // Calcular estadísticas
                TotalMunicipalities = municipalities.Count;
                TotalDistricts = districts.Count;
                ActiveMunicipalities = municipalities.Count(m => m.IsActive);
                ActiveDistricts = districts.Count(d => d.IsActive);
                
                _logger.LogInformation("Estadísticas cargadas: {Municipalities} municipios, {Districts} distritos", 
                    TotalMunicipalities, TotalDistricts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar estadísticas del dashboard");
                
                // Inicializar con valores por defecto en caso de error
                TotalMunicipalities = 0;
                TotalDistricts = 0;
                ActiveMunicipalities = 0;
                ActiveDistricts = 0;
            }
        }
    }
}