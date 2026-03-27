namespace knitnet_verification_api.DTOs
{
    public class VerificationDto
    {
        public int? UserId { get; set; }

        public string? UserName { get; set; }

        public string? AadhaarLast4 { get; set; }

        public string? AadhaarZipUrl { get; set; }

        public string? PassportPhotoUrl { get; set; }

        public string? UniqueId { get; set; }

        public string? ShareCode { get; set; }
    }
}