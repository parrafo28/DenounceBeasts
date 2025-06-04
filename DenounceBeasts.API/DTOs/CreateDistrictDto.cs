namespace DenounceBeasts.API.DTOs
{
    public class CreateDistrictDto
    {
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; }
        public int MunicipalityId { get; set; }
    }
}
