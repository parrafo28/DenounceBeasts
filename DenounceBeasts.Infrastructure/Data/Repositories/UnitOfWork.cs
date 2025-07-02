using DenounceBeasts.Domain.Contracts.Repositories;
using DenounceBeasts.Domain.Entities;

namespace DenounceBeasts.Infrastructure.Data.Repositories
{
    public class UnitOfWork
    {

        public IMunicipaltyRepository Municipalities { get; }
        public IDistrictRepository Districts { get; }

        private readonly DataContext _context;

        public UnitOfWork(DataContext context, IMunicipaltyRepository municipalityRepository,
           IDistrictRepository districtRepository)
        {
            _context = context;
            //Municipalities = municipalityRepository ?? throw new ArgumentNullException(nameof(municipalityRepository));
            //if(municipalityRepository == null)
            //    throw new ArgumentNullException(nameof(municipalityRepository), "Municipality repository cannot be null.");
            Municipalities = municipalityRepository;
            // Municipalities = municipalityRepository ?? new MunicipaltyRepository(_context);
            Districts = districtRepository; 
        }




        public async Task BeginTransactionAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }

        public async Task RollBackTransactionAsync()
        {

            await _context.Database.RollbackTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {

            await _context.Database.CommitTransactionAsync();
        }

        public async Task CompletAsync()
        {
            await _context.SaveChangesAsync();
        }

    }
}
