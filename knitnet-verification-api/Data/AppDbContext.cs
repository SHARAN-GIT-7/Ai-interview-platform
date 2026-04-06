using Microsoft.EntityFrameworkCore;
using knitnet_verification_api.Models;

namespace knitnet_verification_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<IdentityVerification> IdentityVerifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IdentityVerification>()
                .Property(x => x.Id)
                .ValueGeneratedOnAdd();
        }
    }
}