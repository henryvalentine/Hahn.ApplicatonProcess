using Hahn.ApplicatonProcess.May2020.Data.DataContext;
using Hahn.ApplicatonProcess.May2020.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Hahn.ApplicatonProcess.May2020.Domain.Services
{
    public class ApplicantDBInnitializer
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new ApplicantDBContext(serviceProvider.GetRequiredService<DbContextOptions<ApplicantDBContext>>()))
            {
                // Look for any board games already in database.
                if (context.Applicants.Any())
                {
                    return;   // Database has been seeded
                }
                else
                {
                    //else seed a sample applicant into the database
                    context.Applicants.Add(
                        new Applicant
                        {
                            Id = 1,
                            Name = "Tobias",
                            FamilyName = "Bodmann",
                            Address = "Friedhofstraße 11, 93142 Maxhütte-Haidhof, Germany",
                            EmailAdress = "karriere@hahn-softwareentwicklung.de",
                            Age = 28,
                            CountryOfOrigin = "Germany",
                            Hired = true
                        });

                    context.SaveChanges();
                }
               
            }
        }
    }
}
