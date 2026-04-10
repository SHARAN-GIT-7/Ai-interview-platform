using System;
using System.ComponentModel.DataAnnotations;

namespace Knitnet.CompanyInfoApi.Models
{
    public class Company
    {
        [Key]
        public Guid Uid { get; set; }
    }
}
