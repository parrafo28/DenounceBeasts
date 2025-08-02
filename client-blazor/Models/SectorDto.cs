namespace ClientBlazor.Models;

public class SectorDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MunicipalityId { get; set; }
    public string MunicipalityName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateSectorDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MunicipalityId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateSectorDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MunicipalityId { get; set; }
    public bool IsActive { get; set; }
}