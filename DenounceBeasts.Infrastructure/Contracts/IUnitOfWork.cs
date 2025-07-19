using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Infrastructure.Contracts
{
    public interface IUnitOfWork
    {
        IMunicipalityRepository Municipalities { get; }
        ISectorRepository Sectors { get; }
        IRepository<Status> Status { get; }
        IRepository<Complaint> Complaints { get; }
        IRepository<User> Users { get; }
        IRepository<ComplaintType> ComplaintTypes { get; }
        IRepository<Comment> Comments { get; }
        IRepository<Vote> Votes { get; }
        IRepository<Attachment> Attachments { get; }
        IRepository<Role> Roles { get; }
        IRepository<UserRole> UserRoles { get; }
        IRepository<Notification> Notifications { get; }
        IRepository<ComplaintHistory> ComplaintHistories { get; }
        IRepository<UserProfile> UserProfiles { get; }

        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task<int> SaveChangesAsync();
        void Dispose();
        Task RollbackTransactionAsync();
    }
}