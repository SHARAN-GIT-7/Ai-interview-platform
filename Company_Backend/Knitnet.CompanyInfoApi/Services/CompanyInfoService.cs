using System;
using System.Threading.Tasks;
using AutoMapper;
using Knitnet.CompanyInfoApi.DTOs;
using Knitnet.CompanyInfoApi.Models;
using Knitnet.CompanyInfoApi.Repositories;

namespace Knitnet.CompanyInfoApi.Services
{
    public class CompanyInfoService : ICompanyInfoService
    {
        private readonly ICompanyInfoRepository _repo;
        private readonly IMapper _mapper;

        public CompanyInfoService(ICompanyInfoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<CompanyInfoResponseDto> GetAsync(Guid companyId)
        {
            var data = await _repo.GetByCompanyIdAsync(companyId);
            return _mapper.Map<CompanyInfoResponseDto>(data);
        }

        public async Task CreateOrUpdateAsync(Guid companyId, CompanyInfoCreateDto dto)
        {
            var companyExists = await _repo.CompanyExistsAsync(companyId);
            if (!companyExists)
            {
                throw new KeyNotFoundException("Company not found for the provided CompanyId.");
            }

            var existing = await _repo.GetByCompanyIdAsync(companyId);

            if (existing == null)
            {
                var entity = _mapper.Map<CompanyInfo>(dto);
                entity.CompanyId = companyId;
                await _repo.CreateAsync(entity);
            }
            else
            {
                _mapper.Map(dto, existing);
                existing.UpdatedAt = DateTime.UtcNow;
                await _repo.UpdateAsync(existing);
            }
        }
    }
}
