namespace DenounceBeasts.API.DTOs
{
    public class SectorDto
    {

        public int Id { get; set; }
        public string Code { get; set; }

        public string Name { get; set; } = string.Empty;

        public int MunicipalityId { get; set; }
       // public MunicipalityDto Municipality { get;  set; }
        public string MunicipaltyName { get;  set; }
        public string MunicipaltyCode { get;  set; }
    }
}
