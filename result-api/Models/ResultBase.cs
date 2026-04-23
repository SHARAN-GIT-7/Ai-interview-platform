namespace result_api.Models
{
    public class ResultBase
    {
        public int Id { get; set; }

        public string StudentId { get; set; } = "";
        public string TestId { get; set; } = "";
        public string TestCode { get; set; } = "";
        public string CompanyId { get; set; } = "";
        public string HrId { get; set; } = "";

        public double TotalScore { get; set; }
        public double ScoreSecured { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public AptitudeResult? Aptitude { get; set; }
        public CodingResult? Coding { get; set; }
        public AiInterviewResult? AiInterview { get; set; }
        public VerbalResult? Verbal { get; set; }
    }
}