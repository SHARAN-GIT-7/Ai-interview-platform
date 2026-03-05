using KnitNet.API.Data;
using KnitNet.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KnitNet.API.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _db;

        public AuthService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<User> GetOrCreateUser(string azureObjectId, string email, string role)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.AzureAdObjectId == azureObjectId);

            if (user != null)
                return user;

            user = new User
            {
                AzureAdObjectId = azureObjectId,
                Email = email,
                Role = role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user;
        }
    }
}