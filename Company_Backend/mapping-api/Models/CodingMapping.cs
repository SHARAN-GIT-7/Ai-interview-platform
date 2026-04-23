namespace mapping_api.Models
{
    public class CodingMapping
    {
        public int Id { get; set; }
        public int TestMappingId { get; set; }

        public string ProblemCodes { get; set; } = "[]";

        public TestMapping? TestMapping { get; set; }
    }
}