using AutoMapper;
using DenounceBeasts.Application.Contracts;
using DenounceBeasts.Application.DTOs;
using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DenounceBeasts.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Buscar usuario por email
        //var users = await _unitOfWork.Users.GetAllAsync();
        //var user = users.FirstOrDefault(u => u.Email.ToLower() == loginDto.Email.ToLower() && u.IsActive);
        var user = (await _unitOfWork.Users.GetAsync(u => u.Email.ToLower() == loginDto.Email.ToLower() && u.IsActive)).FirstOrDefault();

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        // Verificar contraseña
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        // Obtener roles del usuario
        var userRoles = await _unitOfWork.UserRoles.GetAllAsync();
        var roles = await _unitOfWork.Roles.GetAllAsync();

        var userRoleIds = userRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.RoleId);
        var userRoleNames = roles.Where(r => userRoleIds.Contains(r.Id)).Select(r => r.Name).ToList();

        var userAuthDto = new UserAuthDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone  ,
            Address = user.Address  ,
            Roles = userRoleNames,
            IsActive = user.IsActive
        };

        var expires = DateTime.UtcNow.AddHours(12); // Token válido por 12 horas 
        var token = GenerateJwtToken(userAuthDto, expires);

        return new AuthResponseDto
        {
            Token = token,
            Expires = expires,
            User = userAuthDto
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Verificar si el email ya existe
        if (await EmailExistsAsync(registerDto.Email))
        {
            throw new InvalidOperationException("El email ya está registrado");
        }

        // Crear nuevo usuario
        var user = new User
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email.ToLower(),
            Phone = registerDto.Phone,
            Address = registerDto.Address,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        // Asignar rol de Usuario por defecto
        var roles = await _unitOfWork.Roles.GetAllAsync();
        var userRole = roles.FirstOrDefault(r => r.Name == "Usuario");

        if (userRole != null)
        {
            var userRoleEntity = new UserRole
            {
                UserId = user.Id,
                RoleId = userRole.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.UserRoles.AddAsync(userRoleEntity);
            await _unitOfWork.CompleteAsync();
        }

        // Generar token para el nuevo usuario
        var userAuthDto = new UserAuthDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone ?? string.Empty,
            Address = user.Address ?? string.Empty,
            Roles = userRole != null ? new List<string> { userRole.Name } : new List<string>(),
            IsActive = user.IsActive
        };
        var expires = DateTime.UtcNow.AddHours(12);

        var token = GenerateJwtToken(userAuthDto, expires);

        return new AuthResponseDto
        {
            Token = token,
            Expires = expires,
            User = userAuthDto
        };
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return false;
        }

        // Verificar contraseña actual
        if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("La contraseña actual es incorrecta");
        }

        // Actualizar contraseña
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<UserAuthDto?> GetUserByIdAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return null;
        }

        // Obtener roles del usuario
        var userRoles = await _unitOfWork.UserRoles.GetAllAsync();
        var roles = await _unitOfWork.Roles.GetAllAsync();

        var userRoleIds = userRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.RoleId);
        var userRoleNames = roles.Where(r => userRoleIds.Contains(r.Id)).Select(r => r.Name).ToList();

        return new UserAuthDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone ?? string.Empty,
            Address = user.Address ?? string.Empty,
            Roles = userRoleNames,
            IsActive = user.IsActive
        };
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        return users.Any(u => u.Email.ToLower() == email.ToLower());
    }

    public string GenerateJwtToken(UserAuthDto user, DateTime expires)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "DenounceBeasts";
        var audience = jwtSettings["Audience"] ?? "DenounceBeasts-Users";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new(ClaimTypes.Email, user.Email),
            new("firstName", user.FirstName),
            new("lastName", user.LastName)
        };

        // Agregar roles como claims
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<bool> ValidateUserAsync(string email, string password)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower() && u.IsActive);

        if (user == null)
        {
            return false;
        }

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }
}