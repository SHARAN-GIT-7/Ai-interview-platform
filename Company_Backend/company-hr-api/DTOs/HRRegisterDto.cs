public class HRRegisterDto
{
    public Guid CompanyId { get; set; }

    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Designation { get; set; }
    public string Department { get; set; }

    public string Password { get; set; }
}