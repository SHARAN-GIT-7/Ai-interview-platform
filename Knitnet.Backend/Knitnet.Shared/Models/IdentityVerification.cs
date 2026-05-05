using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Knitnet.Shared.Models;

[Table("identity_verifications")]
public class IdentityVerification
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("unique_id")]
    public string? UniqueId { get; set; }

    [Column("user_name")]
    public string? UserName { get; set; }

    [Column("aadhaar_last4")]
    public string? AadhaarLast4 { get; set; }

    [Column("aadhaar_zip_url")]
    public string? AadhaarZipUrl { get; set; }

    [Column("passport_photo_url")]
    public string? PassportPhotoUrl { get; set; }

    [Column("share_code")]
    public string? ShareCode { get; set; }

    // Navigation property for FK enforcement
    public User? User { get; set; }
}
