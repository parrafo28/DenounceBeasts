using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Infrastructure.Contracts
{
    public interface IUnitOfWork
    {
        IMunicipalityRepository Municipalities { get; }
        ISectorRepository Sectors { get; }
        IRepository<Status> Status { get; }

        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task CompleteAsync();
        void Dispose();
        Task RollbackTransactionAsync();
    }
}