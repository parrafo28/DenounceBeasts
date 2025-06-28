using DenounceBeasts.API.Entities;
using Microsoft.EntityFrameworkCore;
 

namespace DenounceBeasts.API.Data
{
    //is not correct use this name, you need to names like DenounceBeastsDataContext or DenounceBeastsDbContext
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Define DbSets for your entities
        public DbSet<Municipality> Municipalities { get; set; }
        public DbSet<Sector> Sectors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure entity properties and relationships here if needed
            //fluent API configuration

            // User - UserProfile (One-to-One) 
            //modelBuilder.Entity<UserProfile>()
            //                .HasOne(up => up.User)
            //               .WithOne(u => u.Profile)
            //                .HasForeignKey<UserProfile>(up => up.UserId)
            //                .OnDelete(DeleteBehavior.Restrict);

            // User - Complaint (One-to-Many)
            //modelBuilder.Entity<Complaint>()
            //    .HasOne(c => c.User)
            //    .WithMany(u => u.Complaints)
            //    .HasForeignKey(c => c.UserId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // ComplaintType - Complaint (One-to-Many)
            //modelBuilder.Entity<Complaint>()
            //    .HasOne(c => c.ComplaintType)
            //    .WithMany(ct => ct.Complaints)
            //    .HasForeignKey(c => c.ComplaintTypeId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // Status - Complaint (One-to-Many)
            //modelBuilder.Entity<Complaint>()
            //    .HasOne(c => c.Status)
            //    .WithMany(s => s.Complaints)
            //    .HasForeignKey(c => c.StatusId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // Sector - Complaint (One-to-Many)
            //modelBuilder.Entity<Complaint>()
            //    .HasOne(c => c.Sector)
            //    .WithMany(d => d.Complaints)
            //    .HasForeignKey(c => c.SectorId)
            //    .OnDelete(DeleteBehavior.SetNull);

            // Municipality - Sector (One-to-Many)
            //modelBuilder.Entity<Sector>()
            //    .HasOne(d => d.Municipality)
            //    .WithMany(m => m.Sectors)
            //    .HasForeignKey(d => d.MunicipalityId)
            //    .OnDelete(DeleteBehavior.Cascade);

            // Complaint - Attachment (One-to-Many)
            //modelBuilder.Entity<Attachment>()
            //    .HasOne(a => a.Complaint)
            //    .WithMany(c => c.Attachments)
            //    .HasForeignKey(a => a.ComplaintId)
            //    .OnDelete(DeleteBehavior.Cascade);

            // User - Vote - Complaint (Many-to-Many)
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

            // User - Role (Many-to-Many)
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

            // Complaint - ComplaintHistory
            //modelBuilder.Entity<ComplaintHistory>()
            //    .HasOne(ch => ch.Complaint)
            //    .WithMany(c => c.History)
            //    .HasForeignKey(ch => ch.ComplaintId)
            //    .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<ComplaintHistory>()
            //    .HasOne(ch => ch.User)
            //    .WithMany()
            //    .HasForeignKey(ch => ch.UserId)
            //    .OnDelete(DeleteBehavior.SetNull);

            //modelBuilder.Entity<ComplaintHistory>()
            //    .HasOne(ch => ch.Status)
            //    .WithMany()
            //    .HasForeignKey(ch => ch.StatusId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // User - Notification
            //modelBuilder.Entity<Notification>()
            //    .HasOne(n => n.User)
            //    .WithMany()
            //    .HasForeignKey(n => n.UserId)
            //    .OnDelete(DeleteBehavior.Cascade);

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

            //modelBuilder.Entity<Sector>()
            //    .HasIndex(d => new { d.Code, d.MunicipalityId })
            //    .IsUnique();


        }
    }
}
