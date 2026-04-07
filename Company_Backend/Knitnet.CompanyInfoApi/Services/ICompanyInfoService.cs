using System;
using System.Threading.Tasks;
using Knitnet.CompanyInfoApi.DTOs;

namespace Knitnet.CompanyInfoApi.Services
{
    public interface ICompanyInfoService
    {
        Task<CompanyInfoResponseDto> GetAsync(Guid companyId);
        Task CreateOrUpdateAsync(Guid companyId, CompanyInfoCreateDto dto);
    }
}