using Microsoft.AspNetCore.Http;

namespace knitnet_user_api.DTOs
{
    public class ProfileUpdateDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public DateOnly Dob { get; set; }
        public int Age { get; set; }
        public string College { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string PhotoUrl { get; set; }
        public string Gender { get; set; }
    }
}
