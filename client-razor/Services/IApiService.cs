namespace client_razor.Services;

public interface IApiService<TEntity, TCreateDto, TUpdateDto> where TEntity : class
{
    Task<IEnumerable<TEntity>> GetAllAsync();
    Task<TEntity?> GetByIdAsync(int id);
    Task<TEntity> CreateAsync(TCreateDto createDto);
    Task<TEntity> UpdateAsync(int id, TUpdateDto updateDto);
    Task<bool> DeleteAsync(int id);
}