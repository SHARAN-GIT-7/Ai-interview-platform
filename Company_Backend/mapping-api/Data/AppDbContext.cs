using Microsoft.EntityFrameworkCore;
using mapping_api.Models;

namespace mapping_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TestMapping> TestMappings => Set<TestMapping>();
        public DbSet<AiInterviewMapping> AiInterviewMappings => Set<AiInterviewMapping>();
        public DbSet<VerbalMapping> VerbalMappings => Set<VerbalMapping>();
        public DbSet<CodingMapping> CodingMappings => Set<CodingMapping>();
        public DbSet<AptitudeMapping> AptitudeMappings => Set<AptitudeMapping>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TestMapping>()
                .HasOne(t => t.AiInterview)
                .WithOne(a => a.TestMapping)
                .HasForeignKey<AiInterviewMapping>(a => a.TestMappingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TestMapping>()
                .HasOne(t => t.Verbal)
                .WithOne(v => v.TestMapping)
                .HasForeignKey<VerbalMapping>(v => v.TestMappingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TestMapping>()
                .HasOne(t => t.Coding)
                .WithOne(c => c.TestMapping)
                .HasForeignKey<CodingMapping>(c => c.TestMappingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TestMapping>()
                .HasOne(t => t.Aptitude)
                .WithOne(a => a.TestMapping)
                .HasForeignKey<AptitudeMapping>(a => a.TestMappingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}