using Microsoft.EntityFrameworkCore;
using knitnet_user_api.Models;

namespace knitnet_user_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<User> Users { get; set; }
    }
}