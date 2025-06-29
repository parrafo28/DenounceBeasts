using DenounceBeasts.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace DenounceBeasts.Infrastructure
{
    //is not correct use this name, you need to names like DenounceBeastsDataContext or DenounceBeastsDbContext
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Define DbSets for your entities
        public DbSet<DenounceBeasts.Domain.Entities.Municipality> Municipalities { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<ComplaintHistory> ComplaintHistories { get; set; }
        public DbSet<ComplaintType> ComplaintTypes { get; set; }
        public DbSet<Notification> Notification { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Status> Status { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<Sector> Sectors { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure entity properties and relationships here if needed
            //fluent API configuration

            //aditional need it because EF asume "cascade" delete by default due StatusId and ComplaintId are not null
            //the problem with this is than if you delete status that will delete complaints but also complainthistories
            // normally if you want that stupid behavior is up to you, 
            //the problem is than status is related to complaintshistory and when you delete a status will try to delete the record too
            //but the record was deleted before by the cascade delete of complaints,
            //so, ef fail on that escenario but when you apply the migration the database 
            //refuse that kind of behavior
            // Complaint - Status relationship
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Status)
                .WithMany(s => s.Complaints)
                .HasForeignKey(c => c.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            // Complaint - User relationship
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.User)
                .WithMany(u => u.Complaints)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ComplaintHistory - Complaint relationship
            modelBuilder.Entity<ComplaintHistory>()
                .HasOne(ch => ch.Complaint)
                .WithMany(c => c.History)
                .HasForeignKey(ch => ch.ComplaintId)
                .OnDelete(DeleteBehavior.Cascade);

            // ComplaintHistory - Status relationship
            modelBuilder.Entity<ComplaintHistory>()
                .HasOne(ch => ch.Status)
                .WithMany()
                .HasForeignKey(ch => ch.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            // ComplaintHistory - User relationship
            modelBuilder.Entity<ComplaintHistory>()
                .HasOne(ch => ch.User)
                .WithMany()
                .HasForeignKey(ch => ch.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            //aditional

            //User - Vote - Complaint(Many - to - Many)
            modelBuilder.Entity<Vote>()
                .HasOne(v => v.User)
                .WithMany(u => u.Votes)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Vote>()
                .HasOne(v => v.Complaint)
                .WithMany(c => c.Votes)
                .HasForeignKey(v => v.ComplaintId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint for user votes on complaints
            modelBuilder.Entity<Vote>()
                .HasIndex(v => new { v.UserId, v.ComplaintId })
                .IsUnique();

            // User - Comment - Complaint (Many-to-Many)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Complaint)
                .WithMany(c => c.Comments)
                .HasForeignKey(c => c.ComplaintId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment self-referencing relationship for replies
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // User - Role(Many - to - Many)
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint for user roles
            modelBuilder.Entity<UserRole>()
                .HasIndex(ur => new { ur.UserId, ur.RoleId })
                .IsUnique();



            // Indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.NickName)
                .IsUnique();

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<ComplaintType>()
                .HasIndex(ct => ct.Name)
                .IsUnique();

            modelBuilder.Entity<Complaint>()
                .HasIndex(ct => ct.Title);

            modelBuilder.Entity<Status>()
                .HasIndex(s => s.Name)
                .IsUnique();

            modelBuilder.Entity<Municipality>()
                .HasIndex(m => m.Code)
                .IsUnique();



        }
    }
}
