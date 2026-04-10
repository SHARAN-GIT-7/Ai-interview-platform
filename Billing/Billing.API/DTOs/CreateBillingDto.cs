using System;

namespace Billing.API.DTOs
{
    public class CreateBillingDto
    {
        public Guid CompanyId { get; set; }

        public string BillingName { get; set; }
        public string BillingEmail { get; set; }
        public string BillingPhone { get; set; }

        public string Gstin { get; set; }
        public bool IsGstRegistered { get; set; }

        public string Line1 { get; set; }
        public string Line2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
    }
}