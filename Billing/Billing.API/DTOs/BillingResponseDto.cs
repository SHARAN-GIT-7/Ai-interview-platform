using System;

namespace Billing.API.DTOs
{
    public class BillingResponseDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }

        public string BillingName { get; set; }
        public string BillingEmail { get; set; }
        public string BillingPhone { get; set; }

        public string Gstin { get; set; }
        public bool IsGstRegistered { get; set; }

        public string City { get; set; }
        public string State { get; set; }

        public int CreditsBalance { get; set; }
    }
}