using ClientMvc.Models;
using Newtonsoft.Json;
using System.Text;

namespace ClientMvc.Services
{
    // Servicio para comunicarse con la API externa
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiService> _logger;

        public ApiService(HttpClient httpClient, ILogger<ApiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        // ========== MÉTODOS PARA MUNICIPIOS ==========

        // Obtener todos los municipios
        public async Task<List<Municipality>> GetMunicipalitiesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("municipalities");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var municipalities = JsonConvert.DeserializeObject<List<Municipality>>(content);
                
                return municipalities ?? new List<Municipality>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener municipios");
                return new List<Municipality>();
            }
        }

        // Obtener municipio por ID
        public async Task<Municipality?> GetMunicipalityByIdAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"municipalities/{id}");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<Municipality>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener municipio {Id}", id);
                return null;
            }
        }

        // Crear nuevo municipio
        public async Task<bool> CreateMunicipalityAsync(Municipality municipality)
        {
            try
            {
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("municipalities", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear municipio");
                return false;
            }
        }

        // Actualizar municipio existente
        public async Task<bool> UpdateMunicipalityAsync(Municipality municipality)
        {
            try
            {
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("municipalities", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar municipio");
                return false;
            }
        }

        // Eliminar municipio
        public async Task<bool> DeleteMunicipalityAsync(int id)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"municipalities/{id}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar municipio {Id}", id);
                return false;
            }
        }

        // ========== MÉTODOS PARA DISTRITOS ==========

        // Obtener todos los distritos con información del municipio
        public async Task<List<District>> GetDistrictsAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("districts/with-municipality");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var districts = JsonConvert.DeserializeObject<List<District>>(content);
                
                return districts ?? new List<District>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener distritos");
                return new List<District>();
            }
        }

        // Obtener distrito por ID
        public async Task<District?> GetDistrictByIdAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"districts/{id}");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<District>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener distrito {Id}", id);
                return null;
            }
        }

        // Crear nuevo distrito
        public async Task<bool> CreateDistrictAsync(District district)
        {
            try
            {
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("districts", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear distrito");
                return false;
            }
        }

        // Actualizar distrito existente
        public async Task<bool> UpdateDistrictAsync(District district)
        {
            try
            {
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("districts", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar distrito");
                return false;
            }
        }

        // Eliminar distrito
        public async Task<bool> DeleteDistrictAsync(int id)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"districts/{id}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar distrito {Id}", id);
                return false;
            }
        }
    }
}