using ClientRazor.Models;
using Newtonsoft.Json;
using System.Text;

namespace ClientRazor.Services
{
    // Servicio para comunicarse con la API externa usando HttpClient
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiService> _logger;

        public ApiService(HttpClient httpClient, ILogger<ApiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        // ========== OPERACIONES CRUD PARA MUNICIPIOS ==========

        // Obtener todos los municipios
        public async Task<List<Municipality>> GetMunicipalitiesAsync()
        {
            try
            {
                _logger.LogInformation("Obteniendo lista de municipios");
                var response = await _httpClient.GetAsync("municipalities");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var municipalities = JsonConvert.DeserializeObject<List<Municipality>>(content);
                
                _logger.LogInformation("Se obtuvieron {Count} municipios", municipalities?.Count ?? 0);
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
                _logger.LogInformation("Obteniendo municipio con ID: {Id}", id);
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
                _logger.LogInformation("Creando nuevo municipio: {Name}", municipality.Name);
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("municipalities", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio creado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al crear municipio. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
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
                _logger.LogInformation("Actualizando municipio ID: {Id}", municipality.Id);
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("municipalities", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio actualizado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al actualizar municipio. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
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
                _logger.LogInformation("Eliminando municipio ID: {Id}", id);
                var response = await _httpClient.DeleteAsync($"municipalities/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio eliminado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al eliminar municipio. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar municipio {Id}", id);
                return false;
            }
        }

        // ========== OPERACIONES CRUD PARA DISTRITOS ==========

        // Obtener todos los distritos con información del municipio
        public async Task<List<District>> GetDistrictsAsync()
        {
            try
            {
                _logger.LogInformation("Obteniendo lista de distritos");
                var response = await _httpClient.GetAsync("districts/with-municipality");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var districts = JsonConvert.DeserializeObject<List<District>>(content);
                
                _logger.LogInformation("Se obtuvieron {Count} distritos", districts?.Count ?? 0);
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
                _logger.LogInformation("Obteniendo distrito con ID: {Id}", id);
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
                _logger.LogInformation("Creando nuevo distrito: {Name}", district.Name);
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("districts", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito creado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al crear distrito. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
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
                _logger.LogInformation("Actualizando distrito ID: {Id}", district.Id);
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("districts", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito actualizado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al actualizar distrito. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
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
                _logger.LogInformation("Eliminando distrito ID: {Id}", id);
                var response = await _httpClient.DeleteAsync($"districts/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito eliminado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Error al eliminar distrito. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar distrito {Id}", id);
                return false;
            }
        }
    }
}