using Microsoft.EntityFrameworkCore;
using Transactions.API.Data;
using Transactions.API.DTOs;
using Transactions.API.Models;

namespace Transactions.API.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context;

        public TransactionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TransactionResponseDto> CreateAsync(CreateTransactionDto dto)
        {
            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            var balanceEntity = await _context.CreditBalances
                .FirstOrDefaultAsync(x => x.CompanyId == dto.CompanyId);

            if (balanceEntity == null)
            {
                balanceEntity = new CreditBalance
                {
                    CompanyId = dto.CompanyId,
                    Balance = 0,
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.CreditBalances.Add(balanceEntity);
            }

            // Prevent negative balance
            if (balanceEntity.Balance + dto.Credits < 0)
                throw new Exception("Insufficient credits");

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                CompanyId = dto.CompanyId,
                Credits = dto.Credits,
                Type = dto.Type,
                Status = "SUCCESS",
                Description = dto.Description,
                ReferenceId = dto.ReferenceId,
                Amount = dto.Amount
            };

            _context.Transactions.Add(transaction);

            // Update balance
            balanceEntity.Balance += dto.Credits;
            balanceEntity.LastTransactionId = transaction.Id;
            balanceEntity.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return new TransactionResponseDto
            {
                Id = transaction.Id,
                CompanyId = transaction.CompanyId,
                Credits = transaction.Credits,
                Type = transaction.Type,
                Status = transaction.Status,
                BalanceAfter = balanceEntity.Balance,
                CreatedAt = transaction.CreatedAt
            };
        }

        public async Task<int> GetBalanceAsync(Guid companyId)
        {
            var balance = await _context.CreditBalances
                .FirstOrDefaultAsync(x => x.CompanyId == companyId);

            return balance?.Balance ?? 0;
        }
    }
}