using Microsoft.AspNetCore.Mvc;
using test_info_api.DTOs;
using test_info_api.Services;

namespace test_info_api.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly TestService _service;

        public TestController(TestService service)
        {
            _service = service;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTest([FromBody] CreateTestDto dto)
        {
            var result = await _service.CreateTest(dto);

            return Ok(new
            {
                message = "Test created successfully",
                data = result
            });
        }
    }
}