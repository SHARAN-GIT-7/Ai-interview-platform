using CompanyAuthApi.Data;
using CompanyAuthApi.DTOs;
using CompanyAuthApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyAuthApi.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> RegisterAsync(RegisterCompanyDto dto)
        {
            var existing = await _context.Companies
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existing != null)
            {
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                
                if (!string.IsNullOrEmpty(dto.CompanyName) && dto.CompanyName != "Password Reset")
                    existing.CompanyName = dto.CompanyName;
                if (!string.IsNullOrEmpty(dto.ContactNo) && dto.ContactNo != "N/A")
                    existing.ContactNo = dto.ContactNo;

                _context.Companies.Update(existing);
                await _context.SaveChangesAsync();
                
                return "Password changed successfully";
            }

            var company = new Company
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CompanyName = dto.CompanyName,
                ContactNo = dto.ContactNo
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return "Registration successful";
        }

        public async Task<string> LoginAsync(LoginCompanyDto dto)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (company == null ||
                !BCrypt.Net.BCrypt.Verify(dto.Password, company.PasswordHash))
            {
                return "Invalid email or password";
            }

            return "Login successful";
        }

        public async Task<Company?> GetCompanyByEmailAsync(string email)
        {
            return await _context.Companies
                .FirstOrDefaultAsync(x => x.Email == email);
        }
    }
}