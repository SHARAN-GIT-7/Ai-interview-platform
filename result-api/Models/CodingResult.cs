namespace result_api.Models
{
    public class CodingResult
    {
        public int Id { get; set; }
        public int ResultBaseId { get; set; }

        public string CodingCode { get; set; } = "";

        public double ModuleTotalScore { get; set; }
        public double ModuleScoreSecured { get; set; }

        public List<int> TestcaseTotals { get; set; } = new();
        public List<int> TestcasePassed { get; set; } = new();
        public List<string> Answers { get; set; } = new();

        public ResultBase? ResultBase { get; set; }
    }
}