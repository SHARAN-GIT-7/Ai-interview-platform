using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KnitNet.API.Services;

namespace KnitNet.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [Authorize]
        [HttpGet("login")]
        public async Task<IActionResult> Login()
        {
            var azureId = User.FindFirst("sub")?.Value;
            var email = User.FindFirst("emails")?.Value ?? "unknown";
            var policy = User.FindFirst("tfp")?.Value ?? "";

            var role = policy switch
            {
                "B2C_1_student_signup_signin" => "Student",
                "B2C_1_company_signup_signin" => "Company",
                "B2C_1_admin_signup_signin" => "Admin",
                _ => "Unknown"
            };

            var user = await _authService.GetOrCreateUser(azureId!, email, role);

            return Ok(user);
        }
    }
}