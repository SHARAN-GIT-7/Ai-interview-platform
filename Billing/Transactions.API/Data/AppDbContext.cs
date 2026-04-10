using Microsoft.EntityFrameworkCore;
using Transactions.API.Models;

namespace Transactions.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<CreditBalance> CreditBalances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CreditBalance>()
                .HasKey(c => c.CompanyId);

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.ReferenceId)
                .IsUnique(false); // can change later
        }
    }
}