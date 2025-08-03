using DenounceBeasts.Domain.Entities;
using DenounceBeasts.Infrastructure.Contracts;
using DenounceBeasts.Persistence;

namespace DenounceBeasts.Infrastructure.Repositories
{
    public class UnitOfWork : IDisposable, IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        
        public IRepository<Status> Status { get; }
        public IMunicipalityRepository Municipalities { get; }
        public ISectorRepository Sectors { get; }
        public IRepository<Complaint> Complaints { get; }
        public IRepository<User> Users { get; }
        public IRepository<ComplaintType> ComplaintTypes { get; }
        public IRepository<Comment> Comments { get; }
        public IRepository<Vote> Votes { get; }
        public IRepository<Attachment> Attachments { get; }
        public IRepository<Role> Roles { get; }
        public IRepository<UserRole> UserRoles { get; }
        public IRepository<Notification> Notifications { get; }
        public IRepository<ComplaintHistory> ComplaintHistories { get; }
        public IRepository<UserProfile> UserProfiles { get; }

        public UnitOfWork(ApplicationDbContext context,
            IMunicipalityRepository municipalityRepository,
            ISectorRepository sectorRepository,
            IRepository<Status> statusRepository,
            IRepository<Complaint> complaintRepository,
            IRepository<User> userRepository,
            IRepository<ComplaintType> complaintTypeRepository,
            IRepository<Comment> commentRepository,
            IRepository<Vote> voteRepository,
            IRepository<Attachment> attachmentRepository,
            IRepository<Role> roleRepository,
            IRepository<UserRole> userRoleRepository,
            IRepository<Notification> notificationRepository,
            IRepository<ComplaintHistory> complaintHistoryRepository,
            IRepository<UserProfile> userProfileRepository)
        {
            _context = context;
            Sectors = sectorRepository;
            Status = statusRepository;
            Municipalities = municipalityRepository;
            Complaints = complaintRepository;
            Users = userRepository;
            ComplaintTypes = complaintTypeRepository;
            Comments = commentRepository;
            Votes = voteRepository;
            Attachments = attachmentRepository;
            Roles = roleRepository;
            UserRoles = userRoleRepository;
            Notifications = notificationRepository;
            ComplaintHistories = complaintHistoryRepository;
            UserProfiles = userProfileRepository;
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
