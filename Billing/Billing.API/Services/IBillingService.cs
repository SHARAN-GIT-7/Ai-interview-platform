using Billing.API.DTOs;

namespace Billing.API.Services
{
    public interface IBillingService
    {
        Task<BillingResponseDto> CreateOrUpdateAsync(CreateBillingDto dto);
        Task<BillingResponseDto> GetByCompanyIdAsync(Guid companyId);
    }
}