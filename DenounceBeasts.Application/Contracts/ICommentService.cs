using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface ICommentService
    {
        Task<IEnumerable<CommentDto>> GetAllAsync();
        Task<CommentDto> GetByIdAsync(int id);
        Task<CommentDto> CreateAsync(CreateCommentDto createDto);
        Task<CommentDto> UpdateAsync(CommentDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<CommentDto>> GetByComplaintIdAsync(int complaintId);
        Task<IEnumerable<CommentDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<CommentDto>> GetRepliesAsync(int parentCommentId);
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<CommentDto>> GetPagedAsync(int pageNumber, int pageSize);
    }
}