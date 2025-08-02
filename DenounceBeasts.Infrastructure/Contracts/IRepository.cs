using System.Linq.Expressions;

namespace DenounceBeasts.Infrastructure.Contracts
{
    public interface IRepository<T> where T : class
    {
        Task<T> AddAsync(T entity);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate = null);
        Task<bool> DeleteAsync(int id);
        Task<List<T>> GetAllAsync();
        Task<List<T>> GetAsync(Expression<Func<T, bool>> predicate);
        Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T> GetByIdAsync(int id);
        Task<List<T>> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>> predicate = null);
        void Update(T entity);
        Task UpdateAsync(T entity);
    }
}