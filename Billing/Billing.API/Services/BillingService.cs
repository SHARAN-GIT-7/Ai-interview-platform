using Billing.API.Data;
using Billing.API.DTOs;
using Billing.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Billing.API.Services
{
    public class BillingService : IBillingService
    {
        private readonly AppDbContext _context;

        public BillingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BillingResponseDto> CreateOrUpdateAsync(CreateBillingDto dto)
        {
            var existing = await _context.BillingInfos
                .FirstOrDefaultAsync(x => x.CompanyId == dto.CompanyId);

            if (dto.IsGstRegistered && string.IsNullOrEmpty(dto.Gstin))
                throw new Exception("GSTIN required");

            if (existing == null)
            {
                var billing = new BillingInfo
                {
                    Id = Guid.NewGuid(),
                    CompanyId = dto.CompanyId,
                    BillingName = dto.BillingName,
                    BillingEmail = dto.BillingEmail,
                    BillingPhone = dto.BillingPhone,
                    Gstin = dto.Gstin,
                    IsGstRegistered = dto.IsGstRegistered,
                    Line1 = dto.Line1,
                    Line2 = dto.Line2,
                    City = dto.City,
                    State = dto.State,
                    PostalCode = dto.PostalCode,
                    Country = dto.Country
                };

                _context.BillingInfos.Add(billing);
                await _context.SaveChangesAsync();

                return Map(billing);
            }

            // Update
            existing.BillingName = dto.BillingName;
            existing.BillingEmail = dto.BillingEmail;
            existing.BillingPhone = dto.BillingPhone;
            existing.Gstin = dto.Gstin;
            existing.IsGstRegistered = dto.IsGstRegistered;
            existing.Line1 = dto.Line1;
            existing.Line2 = dto.Line2;
            existing.City = dto.City;
            existing.State = dto.State;
            existing.PostalCode = dto.PostalCode;
            existing.Country = dto.Country;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Map(existing);
        }

        public async Task<BillingResponseDto> GetByCompanyIdAsync(Guid companyId)
        {
            var billing = await _context.BillingInfos
                .FirstOrDefaultAsync(x => x.CompanyId == companyId);

            if (billing == null) return null;

            return Map(billing);
        }

        private BillingResponseDto Map(BillingInfo b)
        {
            return new BillingResponseDto
            {
                Id = b.Id,
                CompanyId = b.CompanyId,
                BillingName = b.BillingName,
                BillingEmail = b.BillingEmail,
                BillingPhone = b.BillingPhone,
                Gstin = b.Gstin,
                IsGstRegistered = b.IsGstRegistered,
                City = b.City,
                State = b.State,
                CreditsBalance = b.CreditsBalance
            };
        }
    }
}