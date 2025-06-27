using System.ComponentModel.DataAnnotations;

namespace DenounceBeasts.API.DTOs
{
    public class MunicipalityDto 
    {
        public int Id { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; }
    }
}
