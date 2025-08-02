using BCrypt.Net;

// Programa temporal para generar hashes BCrypt correctos
class Program
{
    static void Main()
    {
        Console.WriteLine("=== Generador de Hashes BCrypt ===");
        Console.WriteLine();
        
        // Generar hash para Admin123!
        string adminPassword = "Admin123!";
        string adminHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
        Console.WriteLine($"Password: {adminPassword}");
        Console.WriteLine($"Hash: {adminHash}");
        Console.WriteLine($"Verificación: {BCrypt.Net.BCrypt.Verify(adminPassword, adminHash)}");
        Console.WriteLine();
        
        // Generar hash para User123!
        string userPassword = "User123!";
        string userHash = BCrypt.Net.BCrypt.HashPassword(userPassword);
        Console.WriteLine($"Password: {userPassword}");
        Console.WriteLine($"Hash: {userHash}");
        Console.WriteLine($"Verificación: {BCrypt.Net.BCrypt.Verify(userPassword, userHash)}");
        Console.WriteLine();
        
        // Código para copiar y pegar en el seeder
        Console.WriteLine("=== Código para el Seeder ===");
        Console.WriteLine($"var adminPasswordHash = \"{adminHash}\"; // Password: \"Admin123!\"");
        Console.WriteLine($"var userPasswordHash = \"{userHash}\"; // Password: \"User123!\"");
    }
}