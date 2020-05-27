using Hahn.ApplicatonProcess.May2020.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Hahn.ApplicatonProcess.May2020.Data.DataContext
{
    public class ApplicantDBContext : DbContext
    {
        public ApplicantDBContext(DbContextOptions<ApplicantDBContext> options)
                 : base(options)
        {

        }

        public DbSet<Applicant> Applicants { get; set; }
    }
}
