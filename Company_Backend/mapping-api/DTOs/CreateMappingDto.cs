namespace mapping_api.DTOs
{
    public class CreateMappingDto
    {
        public string TestId { get; set; } = string.Empty;
        public string TestCode { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public string HrId { get; set; } = string.Empty;

        public string? AiInterviewCode { get; set; }
        public string? VerbalCode { get; set; }

        public List<string>? ProblemCodes { get; set; }

        public string? AptitudeCode { get; set; }
        public int NoOfQuestions { get; set; }
        public List<string>? Topics { get; set; }
    }
}