using result_api.Models;

namespace result_api.Services
{
    public interface IResultService
    {
        Task<object> Create(ResultBase data);
        Task<object> GetAll();
    }
}