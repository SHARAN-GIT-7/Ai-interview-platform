namespace mapping_api.Models
{
    public class TestMapping
    {
        public int Id { get; set; }

        public string TestId { get; set; } = string.Empty;
        public string TestCode { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public string HrId { get; set; } = string.Empty;

        public AiInterviewMapping? AiInterview { get; set; }
        public VerbalMapping? Verbal { get; set; }
        public CodingMapping? Coding { get; set; }
        public AptitudeMapping? Aptitude { get; set; }
    }
}