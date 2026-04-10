using Microsoft.AspNetCore.Mvc;
using Transactions.API.DTOs;
using Transactions.API.Services;

namespace Transactions.API.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;

        public TransactionsController(ITransactionService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTransactionDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpGet("balance/{companyId}")]
        public async Task<IActionResult> GetBalance(Guid companyId)
        {
            var balance = await _service.GetBalanceAsync(companyId);
            return Ok(new { balance });
        }
    }
}