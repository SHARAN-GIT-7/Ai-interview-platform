using Microsoft.EntityFrameworkCore;
using Knitnet.CompanyInfoApi.Models;

namespace Knitnet.CompanyInfoApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyInfo> CompanyInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>()
                .ToTable("Companies")
                .HasKey(c => c.Uid);

            modelBuilder.Entity<CompanyInfo>()
                .HasIndex(c => c.CompanyId)
                .IsUnique();
        }
    }
}
