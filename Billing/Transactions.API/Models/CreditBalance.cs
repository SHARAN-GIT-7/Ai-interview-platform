using System;

namespace Transactions.API.Models
{
    public class CreditBalance
    {
        public Guid CompanyId { get; set; }

        public int Balance { get; set; }

        public Guid? LastTransactionId { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}