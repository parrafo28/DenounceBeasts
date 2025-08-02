using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto> GetByIdAsync(int id);
        Task<UserDto> CreateAsync(CreateUserDto createDto);
        Task<UserDto> UpdateAsync(UserDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<UserDto> GetByEmailAsync(string email);
        Task<UserDto> GetByNickNameAsync(string nickName);
        Task<bool> ValidatePasswordAsync(string email, string password);
        Task<bool> UpdatePasswordAsync(int userId, string newPassword);
        Task<bool> AssignRoleAsync(int userId, string roleName);
        Task<bool> RemoveRoleAsync(int userId, string roleName);
        Task<IEnumerable<string>> GetUserRolesAsync(int userId);
        Task<IEnumerable<UserDto>> GetPagedAsync(int pageNumber, int pageSize);
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<UserDto>> SearchAsync(string searchTerm);
    }
}