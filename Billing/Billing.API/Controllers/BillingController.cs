using Microsoft.AspNetCore.Mvc;
using Billing.API.Services;
using Billing.API.DTOs;

namespace Billing.API.Controllers
{
    [ApiController]
    [Route("api/billing")]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _service;

        public BillingController(IBillingService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdate(CreateBillingDto dto)
        {
            var result = await _service.CreateOrUpdateAsync(dto);
            return Ok(result);
        }

        [HttpGet("{companyId}")]
        public async Task<IActionResult> Get(Guid companyId)
        {
            var result = await _service.GetByCompanyIdAsync(companyId);
            if (result == null) return NotFound();

            return Ok(result);
        }
    }
}