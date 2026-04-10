using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Knitnet.CompanyInfoApi.Data;
using Knitnet.CompanyInfoApi.Models;

namespace Knitnet.CompanyInfoApi.Repositories
{
    public class CompanyInfoRepository : ICompanyInfoRepository
    {
        private readonly AppDbContext _context;

        public CompanyInfoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CompanyExistsAsync(Guid companyId)
        {
            return await _context.Companies.AnyAsync(x => x.Uid == companyId);
        }

        public async Task<CompanyInfo> GetByCompanyIdAsync(Guid companyId)
        {
            return await _context.CompanyInfos
                .FirstOrDefaultAsync(x => x.CompanyId == companyId);
        }

        public async Task CreateAsync(CompanyInfo companyInfo)
        {
            await _context.CompanyInfos.AddAsync(companyInfo);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CompanyInfo companyInfo)
        {
            _context.CompanyInfos.Update(companyInfo);
            await _context.SaveChangesAsync();
        }
    }
}
