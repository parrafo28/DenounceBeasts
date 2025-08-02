using DenounceBeasts.Application.DTOs;

namespace DenounceBeasts.Application.Contracts
{
    public interface IVoteService
    {
        Task<IEnumerable<VoteDto>> GetAllAsync();
        Task<VoteDto> GetByIdAsync(int id);
        Task<VoteDto> CreateAsync(CreateVoteDto createDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<VoteDto>> GetByComplaintIdAsync(int complaintId);
        Task<IEnumerable<VoteDto>> GetByUserIdAsync(int userId);
        Task<VoteDto> GetUserVoteForComplaintAsync(int userId, int complaintId);
        Task<int> GetUpvotesCountAsync(int complaintId);
        Task<int> GetDownvotesCountAsync(int complaintId);
        Task<bool> UpdateVoteAsync(int voteId, bool isUpvote);
        Task<int> GetTotalCountAsync();
    }
}