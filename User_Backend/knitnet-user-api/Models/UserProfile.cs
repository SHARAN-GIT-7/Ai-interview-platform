using System.ComponentModel.DataAnnotations.Schema;

namespace knitnet_user_api.Models
{
    [Table("user_profiles")]
    public class UserProfile
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("full_name")]
        public string FullName { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("dob")]
        public DateOnly Dob { get; set; }

        [Column("age")]
        public int Age { get; set; }

        [Column("college")]
        public string College { get; set; }

        [Column("address")]
        public string Address { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("photo_url")]
        public string PhotoUrl { get; set; }

        [Column("gender")]
        public string Gender { get; set; }
    }
}