using Microsoft.EntityFrameworkCore;
using Billing.API.Models;

namespace Billing.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<BillingInfo> BillingInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillingInfo>()
                .HasIndex(b => b.CompanyId)
                .IsUnique(); // one billing per company
        }
    }
}