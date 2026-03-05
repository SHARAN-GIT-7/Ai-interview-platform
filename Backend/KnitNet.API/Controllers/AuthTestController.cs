using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnitNet.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class AuthTestController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("Public endpoint working");
        }

        [Authorize]
        [HttpGet("secure")]
        public IActionResult Secure()
        {
            var userId = User.FindFirst("sub")?.Value;

            return Ok(new
            {
                message = "Secure endpoint accessed",
                user = userId
            });
        }
    }
}