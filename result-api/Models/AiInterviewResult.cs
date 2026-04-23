namespace result_api.Models
{
    public class AiInterviewResult
    {
        public int Id { get; set; }
        public int ResultBaseId { get; set; }

        public string AiCode { get; set; } = "";

        public double ModuleTotalScore { get; set; }
        public double ModuleScoreSecured { get; set; }

        public List<string> Questions { get; set; } = new();
        public List<string> Answers { get; set; } = new();
        public List<string> CorrectAnswers { get; set; } = new();

        public int Correct { get; set; }
        public int Wrong { get; set; }

        public ResultBase? ResultBase { get; set; }
    }
}