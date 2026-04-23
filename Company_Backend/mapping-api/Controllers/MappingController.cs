using Microsoft.AspNetCore.Mvc;
using mapping_api.DTOs;
using mapping_api.Services;

namespace mapping_api.Controllers
{
    [ApiController]
    [Route("api/mapping")]
    public class MappingController : ControllerBase
    {
        private readonly IMappingService _service;

        public MappingController(IMappingService service)
        {
            _service = service;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(CreateMappingDto dto)
        {
            return Ok(await _service.CreateMappingAsync(dto));
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllMappingsAsync());
        }
    }
}