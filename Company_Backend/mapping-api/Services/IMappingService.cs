using mapping_api.DTOs;

namespace mapping_api.Services
{
    public interface IMappingService
    {
        Task<object> CreateMappingAsync(CreateMappingDto dto);
        Task<object> GetAllMappingsAsync();
    }
}