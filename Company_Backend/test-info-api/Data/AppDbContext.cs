using Microsoft.EntityFrameworkCore;
using test_info_api.Models;

namespace test_info_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TestInfo> TestInfos { get; set; }
    }
}