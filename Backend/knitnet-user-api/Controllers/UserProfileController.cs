using Microsoft.AspNetCore.Mvc;
using knitnet_user_api.Data;
using knitnet_user_api.Models;
using knitnet_user_api.DTOs;
using knitnet_user_api.Services;

namespace knitnet_user_api.Controllers
{
    [ApiController]
    [Route("api/profile")]
    public class UserProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public UserProfileController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // Upload profile photo to Cloudinary
        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadPhoto(IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return BadRequest("No file uploaded");

            var imageUrl = await _cloudinaryService.UploadImageAsync(photo);

            return Ok(new { photoUrl = imageUrl });
        }

        // Create user profile
        [HttpPost("create")]
        public async Task<IActionResult> CreateProfile(ProfileDto model)
        {
            // Check if profile already exists
            var existingProfile = _context.UserProfiles
                .FirstOrDefault(x => x.UserId == model.UserId);

            if (existingProfile != null)
                return BadRequest("Profile already exists for this user");

            var profile = new UserProfile
            {
                UserId = model.UserId,
                FullName = model.FullName,
                Email = model.Email,
                Dob = model.Dob,
                Age = model.Age,
                College = model.College,
                Address = model.Address,
                Phone = model.Phone,
                PhotoUrl = model.PhotoUrl
            };

            _context.UserProfiles.Add(profile);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile created successfully",
                profile
            });
        }

        // Get profile by user id
        [HttpGet("{userId}")]
        public IActionResult GetProfile(int userId)
        {
            var profile = _context.UserProfiles
                .FirstOrDefault(x => x.UserId == userId);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }
    }
}