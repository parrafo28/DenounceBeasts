using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    Task<UserAuthDto?> GetUserByIdAsync(int userId);
    Task<bool> EmailExistsAsync(string email);
    string GenerateJwtToken(UserAuthDto user);
    Task<bool> ValidateUserAsync(string email, string password);
}