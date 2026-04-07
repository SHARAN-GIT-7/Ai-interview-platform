using System;
using System.ComponentModel.DataAnnotations;

namespace Knitnet.CompanyInfoApi.Models
{
    public class CompanyInfo
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CompanyId { get; set; }

        public string Website { get; set; }
        public string Industry { get; set; }
        public string CompanySize { get; set; }
        public int? FoundedYear { get; set; }

        public string Description { get; set; }
        public string LogoUrl { get; set; }

        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }

        public string LinkedinUrl { get; set; }
        public string GithubUrl { get; set; }

        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}