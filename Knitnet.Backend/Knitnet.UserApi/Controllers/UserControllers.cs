using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Knitnet.UserApi.DTOs;
using Knitnet.UserApi.Services;

namespace Knitnet.UserApi.Controllers;

[ApiController]
[Route("api/user/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) { _auth = auth; }

    [HttpPost("signup/student")]
    public async Task<IActionResult> StudentSignup(SignupDto dto)
    {
        try { return Ok(new { message = await _auth.SignupStudentAsync(dto) }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("signup/company")]
    public async Task<IActionResult> CompanySignup(SignupDto dto)
    {
        try { return Ok(new { message = await _auth.SignupCompanyAsync(dto) }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try { return Ok(await _auth.LoginAsync(dto)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        try { return Ok(new { message = await _auth.ResetPasswordAsync(dto) }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpGet("profile/{email}")]
    public async Task<IActionResult> GetProfile(string email)
    {
        var result = await _auth.GetProfileByEmailAsync(email);
        return result == null ? NotFound(new { error = "User not found" }) : Ok(result);
    }
}

[ApiController]
[Route("api/user/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profile;
    private readonly IStorageService _storage;
    public ProfileController(IProfileService profile, IStorageService storage)
    { _profile = profile; _storage = storage; }

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("upload-photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile photo)
    {
        if (photo == null || photo.Length == 0) return BadRequest(new { error = "No file" });
        var url = await _storage.UploadAsync(photo, "profile-images", "photos");
        return Ok(new { photoUrl = url });
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromForm] ProfileCreateDto dto)
    {
        var result = await _profile.CreateOrUpdateAsync(UserId, dto);
        return Ok(new { message = "Profile saved", profile = result });
    }

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId)
    {
        var result = await _profile.GetByUserIdAsync(userId);
        return result == null ? NotFound(new { error = "Profile not found" }) : Ok(result);
    }
}

[ApiController]
[Route("api/user/verification")]
[Authorize(Roles = "student")]
public class VerificationController : ControllerBase
{
    private readonly IVerificationService _verification;
    public VerificationController(IVerificationService verification) { _verification = verification; }

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
        => Ok(await _verification.GetStatusAsync(UserId));

    [HttpPost("create")]
    public async Task<IActionResult> Create(VerificationCreateDto dto)
    {
        var uid = await _verification.CreateAsync(UserId, dto);
        return Ok(new { message = "Verification created", uniqueId = uid });
    }

    [HttpPost("complete")]
    public async Task<IActionResult> Complete(VerificationCompleteDto dto)
    {
        try { return Ok(new { message = "Verification completed", uniqueId = await _verification.CompleteAsync(dto) }); }
        catch (ArgumentException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPost("snapshot/{index:int}")]
    public async Task<IActionResult> SaveSnapshot(int index, IFormFile snapshot)
    {
        try { await _verification.SaveSnapshotAsync(UserId, index, snapshot); return Ok(new { saved = true }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("snapshots")]
    public IActionResult CleanupSnapshots()
    {
        _verification.CleanupSnapshots(UserId); return Ok(new { cleaned = true });
    }
}

[ApiController]
[Route("api/user/results")]
[Authorize(Roles = "student")]
public class StudentResultController : ControllerBase
{
    private readonly IStudentResultService _results;
    public StudentResultController(IStudentResultService results) { _results = results; }

    [HttpGet]
    public async Task<IActionResult> GetMyResults()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _results.GetMyResultsAsync(userId));
    }
}
