namespace DenounceBeasts.API.DTOs
{
    public class UpdateDistrictDto: CreateDistrictDto
    {
        public int Id { get; set; } 
        public bool IsActive { get; set; } = true;
        //public string Name { get; set; }
        //public string Code { get; set; }
        //public int MunicipalityId { get; set; }
    }
}
