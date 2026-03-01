using System.ComponentModel.DataAnnotations;

namespace KnitNet.API.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string AzureAdObjectId { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty; // Student, Company, Admin

        public string? CompanyId { get; set; }
    }
}