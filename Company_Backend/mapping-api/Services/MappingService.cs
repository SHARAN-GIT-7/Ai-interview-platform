using mapping_api.Data;
using mapping_api.DTOs;
using mapping_api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace mapping_api.Services
{
    public class MappingService : IMappingService
    {
        private readonly AppDbContext _context;

        public MappingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> CreateMappingAsync(CreateMappingDto dto)
        {
            var test = new TestMapping
            {
                TestId = dto.TestId,
                TestCode = dto.TestCode,
                CompanyId = dto.CompanyId,
                HrId = dto.HrId
            };

            _context.TestMappings.Add(test);
            await _context.SaveChangesAsync();

            if (dto.AiInterviewCode != null)
            {
                _context.AiInterviewMappings.Add(new AiInterviewMapping
                {
                    TestMappingId = test.Id,
                    AiInterviewCode = dto.AiInterviewCode
                });
            }

            if (dto.VerbalCode != null)
            {
                _context.VerbalMappings.Add(new VerbalMapping
                {
                    TestMappingId = test.Id,
                    VerbalCode = dto.VerbalCode
                });
            }

            if (dto.ProblemCodes != null)
            {
                _context.CodingMappings.Add(new CodingMapping
                {
                    TestMappingId = test.Id,
                    ProblemCodes = JsonSerializer.Serialize(dto.ProblemCodes)
                });
            }

            if (dto.AptitudeCode != null)
            {
                _context.AptitudeMappings.Add(new AptitudeMapping
                {
                    TestMappingId = test.Id,
                    AptitudeCode = dto.AptitudeCode,
                    NoOfQuestions = dto.NoOfQuestions,
                    Topics = JsonSerializer.Serialize(dto.Topics)
                });
            }

            await _context.SaveChangesAsync();

            return new { message = "Mapping created successfully" };
        }

        public async Task<object> GetAllMappingsAsync()
        {
            return await _context.TestMappings
                .Include(t => t.AiInterview)
                .Include(t => t.Verbal)
                .Include(t => t.Coding)
                .Include(t => t.Aptitude)
                .ToListAsync();
        }
    }
}