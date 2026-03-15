namespace knitnet_auth_api.DTOs
{
    public class ResetPasswordDto
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
