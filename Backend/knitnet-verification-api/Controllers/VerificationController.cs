using Microsoft.AspNetCore.Mvc;
using knitnet_verification_api.Data;
using knitnet_verification_api.DTOs;
using knitnet_verification_api.Models;
using Microsoft.EntityFrameworkCore;

namespace knitnet_verification_api.Controllers
{
    [ApiController]
    [Route("api/verification")]
    public class VerificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VerificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("status/{userId}")]
        public async Task<IActionResult> GetVerificationStatus(int userId)
        {
            try
            {
                // Check if there is any completed verification for this user
                // A record is considered complete if it has a PassportPhotoUrl
                var verification = await _context.IdentityVerifications
                    .Where(v => v.UserId == userId && !string.IsNullOrEmpty(v.PassportPhotoUrl))
                    .OrderByDescending(v => v.Id)
                    .FirstOrDefaultAsync();

                if (verification == null)
                {
                    return Ok(new { verified = false });
                }

                return Ok(new { 
                    verified = true, 
                    uniqueId = verification.UniqueId,
                    photoUrl = verification.PassportPhotoUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error", detail = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateVerification(VerificationDto model)
        {
            try 
            {
                var verification = new IdentityVerification
                {
                    UserId = model.UserId,
                    UserName = model.UserName,
                    AadhaarLast4 = model.AadhaarLast4,
                    AadhaarZipUrl = model.AadhaarZipUrl,
                    PassportPhotoUrl = model.PassportPhotoUrl,
                    UniqueId = model.UniqueId ?? Guid.NewGuid().ToString(),
                    ShareCode = model.ShareCode
                };

                _context.IdentityVerifications.Add(verification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Verification created",
                    verification.UniqueId
                });
            }
            catch (Exception ex)
            {
                // Return the actual error message to the frontend for debugging
                return StatusCode(500, new { 
                    message = "Database Error", 
                    detail = ex.InnerException?.Message ?? ex.Message 
                });
            }
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteVerification(VerificationDto model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.UniqueId))
                {
                    return BadRequest(new { message = "UniqueId is required" });
                }

                var verification = _context.IdentityVerifications
                    .FirstOrDefault(v => v.UniqueId == model.UniqueId);

                if (verification == null)
                {
                    return NotFound(new { message = "Verification record not found" });
                }

                verification.PassportPhotoUrl = model.PassportPhotoUrl;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Verification completed",
                    verification.UniqueId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Database Error", 
                    detail = ex.InnerException?.Message ?? ex.Message 
                });
            }
        }
    }
}