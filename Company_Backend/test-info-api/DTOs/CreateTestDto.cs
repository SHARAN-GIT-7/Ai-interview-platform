namespace test_info_api.DTOs
{
    public class CreateTestDto
    {
        public string TestId { get; set; }

        public Guid CompanyId { get; set; }
        public Guid HrId { get; set; }

        public bool AptitudeModule { get; set; }
        public bool VerbalModule { get; set; }
        public bool InterviewModule { get; set; }
        public bool CodingModule { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public int ApproxStudentCount { get; set; }
    }
}