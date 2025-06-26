namespace DenounceBeasts.API.DTOs
{
    public class MunicipaltyDto
    {
        public int Id { get; set; }
        public bool IsActive { get; set; } = true;
        public string Name { get; set; }
        public string Code { get; set; }

    }
}
