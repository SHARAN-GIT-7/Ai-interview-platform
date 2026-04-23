namespace result_api.Models
{
    public class VerbalResult
    {
        public int Id { get; set; }
        public int ResultBaseId { get; set; }

        public string VerbalCode { get; set; } = "";

        public double ModuleTotalScore { get; set; }
        public double ModuleScoreSecured { get; set; }

        public Dictionary<string, double> Metrics { get; set; } = new();

        public List<string> Listening { get; set; } = new();
        public List<string> Speaking { get; set; } = new();

        public ResultBase? ResultBase { get; set; }
    }
}