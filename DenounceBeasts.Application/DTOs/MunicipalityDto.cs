namespace DenounceBeasts.Application.DTOs
{
    public class MunicipalityDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public List<SectorDto>? Sectors { get; set; }
        public int SectorsCount { get; set; }
    }
}
