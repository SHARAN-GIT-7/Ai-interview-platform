using Microsoft.EntityFrameworkCore;
using result_api.Models;

namespace result_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        public DbSet<ResultBase> Results => Set<ResultBase>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AptitudeResult>().Property(x => x.Questions).HasColumnType("jsonb");
            modelBuilder.Entity<AptitudeResult>().Property(x => x.UserAnswers).HasColumnType("jsonb");
            modelBuilder.Entity<AptitudeResult>().Property(x => x.CorrectAnswers).HasColumnType("jsonb");
            modelBuilder.Entity<AptitudeResult>().Property(x => x.Topics).HasColumnType("jsonb");

            modelBuilder.Entity<CodingResult>().Property(x => x.TestcaseTotals).HasColumnType("jsonb");
            modelBuilder.Entity<CodingResult>().Property(x => x.TestcasePassed).HasColumnType("jsonb");
            modelBuilder.Entity<CodingResult>().Property(x => x.Answers).HasColumnType("jsonb");

            modelBuilder.Entity<AiInterviewResult>().Property(x => x.Questions).HasColumnType("jsonb");
            modelBuilder.Entity<AiInterviewResult>().Property(x => x.Answers).HasColumnType("jsonb");
            modelBuilder.Entity<AiInterviewResult>().Property(x => x.CorrectAnswers).HasColumnType("jsonb");

            modelBuilder.Entity<VerbalResult>().Property(x => x.Metrics).HasColumnType("jsonb");
            modelBuilder.Entity<VerbalResult>().Property(x => x.Listening).HasColumnType("jsonb");
            modelBuilder.Entity<VerbalResult>().Property(x => x.Speaking).HasColumnType("jsonb");
        }
    }
}