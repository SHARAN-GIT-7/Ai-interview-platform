using test_info_api.Data;
using test_info_api.Models;
using test_info_api.DTOs;

namespace test_info_api.Services
{
    public class TestService
    {
        private readonly AppDbContext _context;

        public TestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TestInfo> CreateTest(CreateTestDto dto)
{
    var test = new TestInfo
    {
        TestId = dto.TestId,
        TestCode = GenerateTestCode(),

        CompanyId = dto.CompanyId,
        HrId = dto.HrId,

        AptitudeModule = dto.AptitudeModule,
        VerbalModule = dto.VerbalModule,
        InterviewModule = dto.InterviewModule,
        CodingModule = dto.CodingModule,

        // 🔥 FIX HERE
        StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
        EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),

        StartTime = dto.StartTime,
        EndTime = dto.EndTime,

        ApproxStudentCount = dto.ApproxStudentCount
    };

    _context.TestInfos.Add(test);
    await _context.SaveChangesAsync();

    return test;
}

        private string GenerateTestCode()
        {
            return Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
        }
    }
}