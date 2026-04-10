using System;

namespace Transactions.API.DTOs
{
    public class TransactionResponseDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }

        public int Credits { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }

        public int BalanceAfter { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}