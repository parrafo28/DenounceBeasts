namespace DenounceBeasts.API.DTOs
{
    public class CreateDistrictDto
    { 
        public string Name { get; set; }
        public string Code { get; set; }
        public int MunicipalityId { get; set; }
    }
}
