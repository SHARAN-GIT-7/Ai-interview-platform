namespace mapping_api.Models
{
    public class AiInterviewMapping
    {
        public int Id { get; set; }
        public int TestMappingId { get; set; }

        public string AiInterviewCode { get; set; } = string.Empty;

        public TestMapping? TestMapping { get; set; }
    }
}