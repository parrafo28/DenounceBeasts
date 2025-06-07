namespace DenounceBeasts.API.DTOs
{
    public class CreateSectorDto
    { 
          
        public string Code { get; set; }

        public string Name { get; set; } = string.Empty;

        public int MunicipalityId { get; set; }
    }
}
