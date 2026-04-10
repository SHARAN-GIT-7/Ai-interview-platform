using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class HRService
{
    private readonly AppDbContext _context;

    public HRService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsEmailRegistered(string email)
    {
        return await _context.HRs.AnyAsync(x => x.Email == email);
    }

    // Register
    public async Task<string> Register(HRRegisterDto dto)
    {
        var exists = await _context.HRs.AnyAsync(x => x.Email == dto.Email);
        if (exists)
            return "Email already exists";

        var hr = new HR
        {
            HrId = Guid.NewGuid(),
            CompanyId = dto.CompanyId,
            Name = dto.Name,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Designation = dto.Designation,
            Department = dto.Department,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.HRs.Add(hr);
        await _context.SaveChangesAsync();

        return "HR Registered Successfully";
    }

    // Login
    public async Task<object> Login(HRLoginDto dto)
    {
        var hr = await _context.HRs.FirstOrDefaultAsync(x => x.Email == dto.Email);
        if (hr == null)
            return "Invalid email";

        var valid = BCrypt.Net.BCrypt.Verify(dto.Password, hr.PasswordHash);
        if (!valid)
            return "Invalid password";

        return new
        {
            hr.HrId,
            hr.CompanyId,
            hr.Name,
            hr.Email
        };
    }

    // Get HRs by Company
    public async Task<List<HR>> GetByCompany(Guid companyId)
    {
        return await _context.HRs
            .Where(x => x.CompanyId == companyId)
            .ToListAsync();
    }
}