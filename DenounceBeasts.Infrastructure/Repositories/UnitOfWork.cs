using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Persistence;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class UnitOfWork : IDisposable, IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        //private readonly IMunicipalityRepository _municipalityRepository;
        //private readonly ISectorRepository _sectorRepository;
        //private readonly IRepository<Status> _statusRepository;
        public IRepository<Status> Status { get; }
        public IMunicipalityRepository Municipalities { get; }
        public ISectorRepository Sectors { get; }

        public UnitOfWork(ApplicationDbContext context,
            IMunicipalityRepository municipalityRepository,
            ISectorRepository sectorRepository,
          IRepository<Status> statusRepository)
        {
            _context = context;
            //_municipalityRepository = municipalityRepository;
            //_sectorRepository = sectorRepository;
            //_statusRepository = statusRepository;
            Sectors = sectorRepository;
            Status = statusRepository;
            Municipalities = municipalityRepository; 
        }


        // public SectorRepository Sector { get { return _sectorRepository; } }
        //public ISectorRepository Sector => _sectorRepository;
        //public IMunicipalityRepository Municipality => _municipalityRepository;
        //public IRepository<Status> Status => _statusRepository;
        // public SectorRepository Sector => _sectorRepository?? new SectorRepository(_context);
        // public SectorRepository Sector => _sectorRepository?? throw new ArgumentNullException();
        //public SectorRepository Sector
        //{
        //    get
        //    {

        //        // if (_sectorRepository == null)
        //        // {
        //        //     return new SectorRepository(_context);
        //        // }
        //        // //else
        //        // //{
        //        //     return _sectorRepository;
        //        //// }
        //       // return _sectorRepository == null? new SectorRepository(_context) : _sectorRepository;
        //        return _sectorRepository ?? new SectorRepository(_context);
        //    }
        //}

        public async Task CompleteAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }
        public async Task RollbackTransactionAsync()
        {
            await _context.Database.RollbackTransactionAsync();
        }
        public async Task CommitTransactionAsync()
        {
            await _context.Database.CommitTransactionAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
