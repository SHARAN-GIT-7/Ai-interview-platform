using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyAuthApi.Models
{
    public class Company
    {
        [Key]
        public Guid Uid { get; set; } = Guid.NewGuid();

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public string CompanyName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
