using Microsoft.AspNetCore.Mvc;
using knitnet_auth_api.Data;
using knitnet_auth_api.Models;
using knitnet_auth_api.DTOs;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace knitnet_auth_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("signup/student")]
        public async Task<IActionResult> StudentSignup(SignupDto model)
        {
            if (model.Password != model.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }

            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Role = "student"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Student account created");
        }

        [HttpPost("signup/company")]
        public async Task<IActionResult> CompanySignup(SignupDto model)
        {
            if (model.Password != model.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }

            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Role = "company"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Company account created");
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto model)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == model.Email);

            if (user == null)
                return Unauthorized("User not found");

            bool valid = BCrypt.Net.BCrypt.Verify(model.Password, user.Password);

            if (!valid)
                return Unauthorized("Invalid password");

            var token = GenerateJwt(user);

            return Ok(new
            {
                token,
                role = user.Role
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            if (model.NewPassword != model.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }

            var user = _context.Users.FirstOrDefault(x => x.Email == model.Email);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Password updated successfully");
        }

        private string GenerateJwt(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.Role,user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("super_secret_key_for_knitnet_2026_jwt!"));

            var creds = new SigningCredentials(key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}