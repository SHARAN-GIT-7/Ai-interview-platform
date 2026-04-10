using System;

namespace Billing.API.Models
{
    public class BillingInfo
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }

        public string BillingName { get; set; }
        public string BillingEmail { get; set; }
        public string BillingPhone { get; set; }

        public string Gstin { get; set; }
        public bool IsGstRegistered { get; set; }

        // Address
        public string Line1 { get; set; }
        public string Line2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }

        public int CreditsBalance { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}