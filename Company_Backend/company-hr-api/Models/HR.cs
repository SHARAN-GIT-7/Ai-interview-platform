using System;
using System.ComponentModel.DataAnnotations;

public class HR
{
    [Key]
    public Guid HrId { get; set; }

    public Guid CompanyId { get; set; }

    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Designation { get; set; }
    public string Department { get; set; }

    public string PasswordHash { get; set; }
}