using ClientBlazor.Models;
using Newtonsoft.Json;
using System.Text;

namespace ClientBlazor.Services
{
    /// <summary>
    /// Servicio para comunicarse con la API externa usando HttpClient
    /// Implementa métodos CRUD para Municipios y Distritos
    /// </summary>
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiService> _logger;

        public ApiService(HttpClient httpClient, ILogger<ApiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        #region Operaciones CRUD para Municipios

        /// <summary>
        /// Obtiene todos los municipios de la API
        /// </summary>
        public async Task<List<Municipality>> GetMunicipalitiesAsync()
        {
            try
            {
                _logger.LogInformation("Obteniendo lista de municipios desde la API");
                var response = await _httpClient.GetAsync("municipalities");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var municipalities = JsonConvert.DeserializeObject<List<Municipality>>(content) ?? new List<Municipality>();
                    
                    _logger.LogInformation("Se obtuvieron {Count} municipios exitosamente", municipalities.Count);
                    return municipalities;
                }
                else
                {
                    _logger.LogWarning("Error al obtener municipios. StatusCode: {StatusCode}", response.StatusCode);
                    return new List<Municipality>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al obtener municipios");
                return new List<Municipality>();
            }
        }

        /// <summary>
        /// Obtiene un municipio específico por su ID
        /// </summary>
        public async Task<Municipality?> GetMunicipalityByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Obteniendo municipio con ID: {Id}", id);
                var response = await _httpClient.GetAsync($"municipalities/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var municipality = JsonConvert.DeserializeObject<Municipality>(content);
                    
                    _logger.LogInformation("Municipio {Id} obtenido exitosamente", id);
                    return municipality;
                }
                else
                {
                    _logger.LogWarning("Municipio {Id} no encontrado. StatusCode: {StatusCode}", id, response.StatusCode);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al obtener municipio {Id}", id);
                return null;
            }
        }

        /// <summary>
        /// Crea un nuevo municipio
        /// </summary>
        public async Task<ApiResult> CreateMunicipalityAsync(Municipality municipality)
        {
            try
            {
                _logger.LogInformation("Creando nuevo municipio: {Name}", municipality.Name);
                
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("municipalities", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio '{Name}' creado exitosamente", municipality.Name);
                    return new ApiResult { Success = true, Message = "Municipio creado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al crear municipio. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al crear municipio: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al crear municipio");
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        /// <summary>
        /// Actualiza un municipio existente
        /// </summary>
        public async Task<ApiResult> UpdateMunicipalityAsync(Municipality municipality)
        {
            try
            {
                _logger.LogInformation("Actualizando municipio ID: {Id}", municipality.Id);
                
                var json = JsonConvert.SerializeObject(municipality);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("municipalities", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio {Id} actualizado exitosamente", municipality.Id);
                    return new ApiResult { Success = true, Message = "Municipio actualizado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al actualizar municipio. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al actualizar municipio: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al actualizar municipio {Id}", municipality.Id);
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        /// <summary>
        /// Elimina un municipio por su ID
        /// </summary>
        public async Task<ApiResult> DeleteMunicipalityAsync(int id)
        {
            try
            {
                _logger.LogInformation("Eliminando municipio ID: {Id}", id);
                
                var response = await _httpClient.DeleteAsync($"municipalities/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Municipio {Id} eliminado exitosamente", id);
                    return new ApiResult { Success = true, Message = "Municipio eliminado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al eliminar municipio. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al eliminar municipio: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al eliminar municipio {Id}", id);
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        #endregion

        #region Operaciones CRUD para Distritos

        /// <summary>
        /// Obtiene todos los distritos con información del municipio
        /// </summary>
        public async Task<List<District>> GetDistrictsAsync()
        {
            try
            {
                _logger.LogInformation("Obteniendo lista de distritos desde la API");
                var response = await _httpClient.GetAsync("districts/with-municipality");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var districts = JsonConvert.DeserializeObject<List<District>>(content) ?? new List<District>();
                    
                    _logger.LogInformation("Se obtuvieron {Count} distritos exitosamente", districts.Count);
                    return districts;
                }
                else
                {
                    _logger.LogWarning("Error al obtener distritos. StatusCode: {StatusCode}", response.StatusCode);
                    return new List<District>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al obtener distritos");
                return new List<District>();
            }
        }

        /// <summary>
        /// Obtiene un distrito específico por su ID
        /// </summary>
        public async Task<District?> GetDistrictByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Obteniendo distrito con ID: {Id}", id);
                var response = await _httpClient.GetAsync($"districts/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var district = JsonConvert.DeserializeObject<District>(content);
                    
                    _logger.LogInformation("Distrito {Id} obtenido exitosamente", id);
                    return district;
                }
                else
                {
                    _logger.LogWarning("Distrito {Id} no encontrado. StatusCode: {StatusCode}", id, response.StatusCode);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al obtener distrito {Id}", id);
                return null;
            }
        }

        /// <summary>
        /// Crea un nuevo distrito
        /// </summary>
        public async Task<ApiResult> CreateDistrictAsync(District district)
        {
            try
            {
                _logger.LogInformation("Creando nuevo distrito: {Name}", district.Name);
                
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("districts", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito '{Name}' creado exitosamente", district.Name);
                    return new ApiResult { Success = true, Message = "Distrito creado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al crear distrito. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al crear distrito: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al crear distrito");
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        /// <summary>
        /// Actualiza un distrito existente
        /// </summary>
        public async Task<ApiResult> UpdateDistrictAsync(District district)
        {
            try
            {
                _logger.LogInformation("Actualizando distrito ID: {Id}", district.Id);
                
                var json = JsonConvert.SerializeObject(district);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync("districts", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito {Id} actualizado exitosamente", district.Id);
                    return new ApiResult { Success = true, Message = "Distrito actualizado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al actualizar distrito. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al actualizar distrito: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al actualizar distrito {Id}", district.Id);
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        /// <summary>
        /// Elimina un distrito por su ID
        /// </summary>
        public async Task<ApiResult> DeleteDistrictAsync(int id)
        {
            try
            {
                _logger.LogInformation("Eliminando distrito ID: {Id}", id);
                
                var response = await _httpClient.DeleteAsync($"districts/{id}");
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Distrito {Id} eliminado exitosamente", id);
                    return new ApiResult { Success = true, Message = "Distrito eliminado exitosamente" };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al eliminar distrito. StatusCode: {StatusCode}, Content: {Content}", 
                        response.StatusCode, errorContent);
                    return new ApiResult { Success = false, Message = $"Error al eliminar distrito: {response.StatusCode}" };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Excepción al eliminar distrito {Id}", id);
                return new ApiResult { Success = false, Message = "Error interno del servidor" };
            }
        }

        #endregion
    }

    /// <summary>
    /// Clase para representar el resultado de operaciones de la API
    /// </summary>
    public class ApiResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}