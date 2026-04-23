namespace result_api.Models
{
    public class AptitudeResult
    {
        public int Id { get; set; }
        public int ResultBaseId { get; set; }

        public string AptitudeCode { get; set; } = "";

        public double ModuleTotalScore { get; set; }
        public double ModuleScoreSecured { get; set; }

        public List<string> Questions { get; set; } = new();
        public List<string> UserAnswers { get; set; } = new();
        public List<string> CorrectAnswers { get; set; } = new();
        public List<string> Topics { get; set; } = new();

        public int Correct { get; set; }
        public int Incorrect { get; set; }

        public ResultBase? ResultBase { get; set; }
    }
}