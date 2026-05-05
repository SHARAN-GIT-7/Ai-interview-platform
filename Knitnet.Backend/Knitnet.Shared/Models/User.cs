using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Knitnet.Shared.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = "student";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties for FK enforcement
    public Company? Company { get; set; }
    public UserProfile? Profile { get; set; }
    public ICollection<IdentityVerification> IdentityVerifications { get; set; } = new List<IdentityVerification>();
}
