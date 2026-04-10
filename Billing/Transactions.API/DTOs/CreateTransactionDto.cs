using System;

namespace Transactions.API.DTOs
{
    public class CreateTransactionDto
    {
        public Guid CompanyId { get; set; }

        public int Credits { get; set; }
        public string Type { get; set; }

        public string Description { get; set; }
        public string ReferenceId { get; set; }

        public decimal Amount { get; set; }
    }
}