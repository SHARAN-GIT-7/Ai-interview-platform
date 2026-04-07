using System;

namespace Knitnet.CompanyInfoApi.DTOs
{
    public class CompanyInfoCreateDto
    {
        public Guid CompanyId { get; set; }   // ✅ ADD THIS

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
    }
}