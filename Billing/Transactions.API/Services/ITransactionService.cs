using Transactions.API.DTOs;

namespace Transactions.API.Services
{
    public interface ITransactionService
    {
        Task<TransactionResponseDto> CreateAsync(CreateTransactionDto dto);
        Task<int> GetBalanceAsync(Guid companyId);
    }
}