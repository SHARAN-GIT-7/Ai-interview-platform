using System;

namespace Knitnet.CompanyInfoApi.DTOs
{
    public class CompanyInfoResponseDto
    {
        public Guid CompanyId { get; set; }

        public string Website { get; set; }
        public string Industry { get; set; }
        public string CompanySize { get; set; }

        public string Description { get; set; }
        public string LogoUrl { get; set; }

        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
    }
}