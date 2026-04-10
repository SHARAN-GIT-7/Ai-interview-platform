using System;
using System.Threading.Tasks;
using Knitnet.CompanyInfoApi.Models;

namespace Knitnet.CompanyInfoApi.Repositories
{
    public interface ICompanyInfoRepository
    {
        Task<bool> CompanyExistsAsync(Guid companyId);
        Task<CompanyInfo> GetByCompanyIdAsync(Guid companyId);
        Task CreateAsync(CompanyInfo companyInfo);
        Task UpdateAsync(CompanyInfo companyInfo);
    }
}
