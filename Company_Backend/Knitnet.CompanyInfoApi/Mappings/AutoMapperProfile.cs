using AutoMapper;
using Knitnet.CompanyInfoApi.Models;
using Knitnet.CompanyInfoApi.DTOs;

namespace Knitnet.CompanyInfoApi.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<CompanyInfoCreateDto, CompanyInfo>();
            CreateMap<CompanyInfo, CompanyInfoResponseDto>();
        }
    }
}