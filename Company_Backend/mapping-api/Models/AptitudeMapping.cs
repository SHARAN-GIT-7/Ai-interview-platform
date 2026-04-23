namespace mapping_api.Models
{
    public class AptitudeMapping
    {
        public int Id { get; set; }
        public int TestMappingId { get; set; }

        public string AptitudeCode { get; set; } = string.Empty;
        public int NoOfQuestions { get; set; }

        public string Topics { get; set; } = "[]";

        public TestMapping? TestMapping { get; set; }
    }
}