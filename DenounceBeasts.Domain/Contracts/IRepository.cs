
namespace DenounceBeasts.Domain.Contracts
{
    public interface IRepository<T> where T : class
    {
        Task<T> CreateAsync(T entity);
        Task<bool> DeleteAsync(int id);
        Task<List<T>> GetAllAsync();
        Task<T> GetByIdAsync(int id);
        Task<T> UpdateAsync(T entity);
    }
}