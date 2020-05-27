using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Hahn.ApplicatonProcess.May2020.Data.Models
{
    public class Applicant
    {
        public int Id { get; set; }
       [StringLength(250, MinimumLength = 5), Required]
        public string Name { get; set; }
        [StringLength(250, MinimumLength = 5), Required]
        public string FamilyName { get; set; }
        [Required, StringLength(500, MinimumLength = 10)]
        public string Address { get; set; }
        [Required, EmailAddress]
        public string EmailAdress { get; set; }
        [Required]
        public string CountryOfOrigin { get; set; }
        [Required]
        public int Age { get; set; }
        [Required, DefaultValue(false)]
        public bool Hired { get; set; }
    }
}
