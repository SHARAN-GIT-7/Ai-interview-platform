using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Knitnet.Shared.Models;
using Knitnet.Shared.Settings;
using Knitnet.Shared.Services;
using Knitnet.UserApi.Data;
using Knitnet.UserApi.DTOs;

namespace Knitnet.UserApi.Services;

// ─── Interface ───────────────────────────────────────────────
public interface IAuthService
{
    Task<string> SignupStudentAsync(SignupDto dto);
    Task<string> SignupCompanyAsync(SignupDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<string> ResetPasswordAsync(ResetPasswordDto dto);
    Task<object?> GetProfileByEmailAsync(string email);
}

// ─── Implementation ──────────────────────────────────────────
/// <summary>
/// FIX 1 APPLIED: Company creation now delegates to CompanyProvisionService.
/// No more direct EF insert into Companies table from AuthService.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserDbContext _db;
    private readonly JwtSettings _jwt;
    private readonly IJwtTokenService _tokenService;
    private readonly ICompanyProvisionService _companyProvisioner;

    public AuthService(
        UserDbContext db,
        IOptions<JwtSettings> jwt,
        IJwtTokenService tokenService,
        ICompanyProvisionService companyProvisioner)
    {
        _db = db;
        _jwt = jwt.Value;
        _tokenService = tokenService;
        _companyProvisioner = companyProvisioner;
    }

    public async Task<string> SignupStudentAsync(SignupDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            throw new ArgumentException("Passwords do not match");
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new ArgumentException("Email already registered");

        _db.Users.Add(new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "student"
        });
        await _db.SaveChangesAsync();
        return "Student account created";
    }

    public async Task<string> SignupCompanyAsync(SignupDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            throw new ArgumentException("Passwords do not match");
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new ArgumentException("Email already registered");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "company"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // FIX 1: Delegate to shared CompanyProvisionService
        // This is the ONLY path for company creation — no duplicate logic
        await _companyProvisioner.ProvisionCompanyAsync(
            _db,
            user.Id,
            dto.CompanyName ?? dto.Name,
            dto.ContactNo ?? string.Empty);

        return "Company account created";
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            throw new UnauthorizedAccessException("Invalid credentials");

        Guid? companyId = null;
        if (user.Role == "company")
        {
            var company = await _db.Companies.FirstOrDefaultAsync(c => c.UserId == user.Id);
            companyId = company?.Uid;
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role)
        };
        if (companyId.HasValue)
            claims.Add(new("companyId", companyId.Value.ToString()));

        return new LoginResponseDto
        {
            Token = _tokenService.GenerateToken(claims, _jwt),
            Role = user.Role,
            UserId = user.Id,
            CompanyId = companyId
        };
    }

    public async Task<string> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmPassword)
            throw new ArgumentException("Passwords do not match");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new ArgumentException("User not found");

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return "Password updated";
    }

    public async Task<object?> GetProfileByEmailAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user == null ? null : new { user.Name, user.Email, user.Role };
    }
}
