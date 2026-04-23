using Microsoft.AspNetCore.Mvc;
using result_api.Models;
using result_api.Services;

namespace result_api.Controllers
{
    [ApiController]
    [Route("api/results")]
    public class ResultController : ControllerBase
    {
        private readonly IResultService _service;

        public ResultController(IResultService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(ResultBase data)
        {
            return Ok(await _service.Create(data));
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _service.GetAll());
        }
    }
}