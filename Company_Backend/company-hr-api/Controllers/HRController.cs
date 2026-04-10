using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class HRController : ControllerBase
{
    private readonly HRService _service;

    public HRController(HRService service)
    {
        _service = service;
    }

    [HttpGet("exists")]
    public async Task<IActionResult> Exists([FromQuery] string email)
    {
        var registered = await _service.IsEmailRegistered(email);
        return Ok(new { registered });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(HRRegisterDto dto)
    {
        var result = await _service.Register(dto);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(HRLoginDto dto)
    {
        var result = await _service.Login(dto);
        return Ok(result);
    }

    [HttpGet("company/{companyId}")]
    public async Task<IActionResult> GetByCompany(Guid companyId)
    {
        var result = await _service.GetByCompany(companyId);
        return Ok(result);
    }
}