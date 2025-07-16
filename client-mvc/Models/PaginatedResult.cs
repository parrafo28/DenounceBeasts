namespace ClientMvc.Models
{
    // Modelo para manejar resultados paginados
    public class PaginatedResult<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public int PageSize { get; set; }
        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPages;
        
        public PaginatedResult(List<T> data, int currentPage, int pageSize)
        {
            TotalItems = data.Count;
            PageSize = pageSize;
            CurrentPage = currentPage;
            TotalPages = (int)Math.Ceiling(TotalItems / (double)PageSize);
            
            Data = data.Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
        }
    }
}