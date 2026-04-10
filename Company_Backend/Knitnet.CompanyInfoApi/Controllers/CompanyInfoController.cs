using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Knitnet.CompanyInfoApi.Services;
using Knitnet.CompanyInfoApi.DTOs;

namespace Knitnet.CompanyInfoApi.Controllers
{
    [ApiController]
    [Route("api/company-info")]
    public class CompanyInfoController : ControllerBase
    {
        private readonly ICompanyInfoService _service;

        public CompanyInfoController(ICompanyInfoService service)
        {
            _service = service;
        }

        [HttpGet("{companyId}")]
public async Task<IActionResult> Get(Guid companyId)
{
    var result = await _service.GetAsync(companyId);
    return Ok(result);
}

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdate([FromBody] CompanyInfoCreateDto dto)
        {
            if (dto.CompanyId == Guid.Empty)
                return BadRequest("CompanyId is required");

            try
            {
                await _service.CreateOrUpdateAsync(dto.CompanyId, dto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }

            return Ok("Saved successfully");
        }
    }
}
