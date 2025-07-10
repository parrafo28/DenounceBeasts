using DenounceBeasts.Domain.Contracts.Repositories;

namespace DenounceBeasts.Domain.Contracts
{
    public interface IUnitOfWork
    {
        IDistrictRepository Districts { get; }
        IMunicipaltyRepository Municipalities { get; }

        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task CompletAsync();
        Task RollBackTransactionAsync();
    }
}