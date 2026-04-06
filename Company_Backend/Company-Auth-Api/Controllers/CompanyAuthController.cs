using Microsoft.AspNetCore.Mvc;
using CompanyAuthApi.DTOs;
using CompanyAuthApi.Services;

namespace CompanyAuthApi.Controllers
{
    [ApiController]
    [Route("api/company/auth")]
    public class CompanyAuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public CompanyAuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterCompanyDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            if (result == "Email already exists")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCompanyDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (result == "Invalid email or password")
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("Email is required");

            var company = await _authService.GetCompanyByEmailAsync(email);

            if (company == null)
                return NotFound("Company not found");

            return Ok(company);
        }
    }
}