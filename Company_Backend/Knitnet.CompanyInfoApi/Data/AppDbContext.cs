using Microsoft.EntityFrameworkCore;
using Knitnet.CompanyInfoApi.Models;

namespace Knitnet.CompanyInfoApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<CompanyInfo> CompanyInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CompanyInfo>()
                .HasIndex(c => c.CompanyId)
                .IsUnique();
        }
    }
}