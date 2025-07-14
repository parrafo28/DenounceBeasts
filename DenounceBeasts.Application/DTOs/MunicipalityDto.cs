
namespace DenounceBeasts.Application.DTOs
{
    public class MunicipalityDto
    {
        public int Id { get;  set; }
        public string Code { get;  set; }
        public string Name { get;  set; }
        public List<SectorDto>? Sectors { get;  set; }
    }
}
