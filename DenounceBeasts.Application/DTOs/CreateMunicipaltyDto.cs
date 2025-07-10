namespace DenounceBeasts.Application.DTOs
{
    public class CreateMunicipaltyDto
    {
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; } 
    }
}
