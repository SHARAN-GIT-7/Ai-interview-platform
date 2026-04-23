namespace mapping_api.Models
{
    public class VerbalMapping
    {
        public int Id { get; set; }
        public int TestMappingId { get; set; }

        public string VerbalCode { get; set; } = string.Empty;

        public TestMapping? TestMapping { get; set; }
    }
}