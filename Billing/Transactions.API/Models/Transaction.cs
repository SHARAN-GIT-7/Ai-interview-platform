using System;

namespace Transactions.API.Models
{
    public class Transaction
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }

        public int Credits { get; set; } // + or -

        public string Type { get; set; } // PURCHASE, USAGE
        public string Status { get; set; } // SUCCESS, FAILED

        public string Description { get; set; }
        public string ReferenceId { get; set; }

        public decimal Amount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}