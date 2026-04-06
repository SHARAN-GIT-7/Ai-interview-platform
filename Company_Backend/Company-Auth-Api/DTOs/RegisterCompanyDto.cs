namespace CompanyAuthApi.DTOs
{
    public class RegisterCompanyDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
    }
}
