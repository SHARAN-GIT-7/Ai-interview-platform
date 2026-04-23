using result_api.Data;
using result_api.Models;
using Microsoft.EntityFrameworkCore;

namespace result_api.Services
{
    public class ResultService : IResultService
    {
        private readonly AppDbContext _context;

        public ResultService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> Create(ResultBase data)
        {
            _context.Results.Add(data);
            await _context.SaveChangesAsync();
            return data;
        }

        public async Task<object> GetAll()
        {
            return await _context.Results
                .Include(x => x.Aptitude)
                .Include(x => x.Coding)
                .Include(x => x.AiInterview)
                .Include(x => x.Verbal)
                .ToListAsync();
        }
    }
}