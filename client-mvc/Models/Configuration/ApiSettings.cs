namespace DenounceBeasts.WebClient.Models.Configuration;

public class ApiSettings
{
    public string BaseUrl { get; set; } = "https://localhost:7175";
    public int Timeout { get; set; } = 30;
    public int RetryAttempts { get; set; } = 3;
    public int CacheTimeout { get; set; } = 300;
}