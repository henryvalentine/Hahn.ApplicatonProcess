using Hahn.ApplicatonProcess.May2020.Data.DataContext;
using Hahn.ApplicatonProcess.May2020.Data.Models;
using Hahn.ApplicatonProcess.May2020.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Hahn.ApplicatonProcess.May2020.Domain.Services
{
    public class ApplicantService: IApplicantService
    {
        private readonly ApplicantDBContext _context;
        private readonly ILogger<ApplicantService> _logger;
        public ApplicantService(ApplicantDBContext ctx, ILogger<ApplicantService> logger = null)
        {
            _context = ctx;
            _logger = logger;
        }
        public long AddApplicant(Applicant applicant)
        {
            try
            {
                var duplicates = _context.Applicants.Count(m => m.EmailAdress.Trim() == applicant.EmailAdress.Trim());
                if (duplicates > 0)
                {
                    //Applicant is already added
                    return -3;
                }

                //Determine the next Id
                applicant.Id = _context.Applicants.Select(x => x.Id).Max() + 1;

                //insert Applicant
                _context.Applicants.Add(applicant);
                _context.SaveChanges();
                return applicant.Id;

            }
            catch (Exception e)
            {
                //Log Error
                return 0;
            }
        }
       
        public long UpdateApplicant(Applicant applicant)
        {
            try
            {
                if (applicant == null || applicant.Id < 1)
                {
                    return -2;
                }
                var applicantEntities = _context.Applicants.Where(m => m.Id == applicant.Id).ToList();
                if (!applicantEntities.Any())
                {
                    //Applicant not found
                    return -2;
                }

                var applicantEntity = applicantEntities[0];

                //Do not modify an existing email
                applicantEntity.Address = applicant.Address;
                applicantEntity.Hired = applicant.Hired;
                applicantEntity.Age = applicant.Age;
                applicantEntity.CountryOfOrigin = applicant.CountryOfOrigin;
                applicantEntity.Name = applicant.Name;
                applicantEntity.FamilyName = applicant.FamilyName;
                _context.Entry(applicantEntity).State = EntityState.Modified;
                _context.SaveChanges();
                return applicantEntity.Id;

            }
            catch (Exception ex)
            {
                // Log Error
                return 0;
            }
        }

        public int DeleteApplicant(int applicantId)
        {
            try
            {
                var nup = _context.Applicants.Where(m => m.Id == applicantId).ToList();
                if (nup.Any())
                {
                    var d = nup[0];
                    _context.Remove(d);
                    _context.SaveChanges();
                    return d.Id;
                }
                //Applicant not found
                return -3;
            }
            catch (Exception ex)
            {
                //Log Error
                return 0;
            }
        }

        public Applicant GetApplicantByEmail(string email)
        {
            try
            {
                var applicants = _context.Applicants.Where(m => m.EmailAdress == email).ToList();
                if (!applicants.Any())
                {
                    //Applicant not found, return an empty applicant object
                    return new Applicant();
                }

                var applicant = applicants[0];
                return applicant;

            }
            catch (Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger?.LogInformation(message);
                return new Applicant();
            }
        }

        public Applicant GetApplicantById(int applicantId)
        {
            try
            {
                var applicants = _context.Applicants.Where(m => m.Id == applicantId).ToList();
                if (!applicants.Any())
                {
                    //Applicant not found, return an empty applicant object
                    return new Applicant();
                }

                var applicant = applicants[0];
                return applicant;

            }
            catch (Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger?.LogInformation(message);
                return new Applicant();
            }
        }

        public List<Applicant> GetApplicants(int itemsPerPage, int pageNumber, out int dataCount, string searchTerm)
        {            
            try
            {
                var skip = (pageNumber - 1) * itemsPerPage;
                var applicants = new List<Applicant>();

                _logger?.LogInformation("Applicants service called!!!!");

                //the request is a search
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    //use pagination to get the applicants' data that meet the search criteria 
                    applicants = _context.Applicants.Where(m => 
                    m.Name.ToLower().Trim().Contains(searchTerm.ToLower().Trim())
                    || m.FamilyName.ToLower().Trim().Contains(searchTerm.ToLower().Trim())
                    || m.EmailAdress.Trim().Contains(searchTerm.Trim())
                    ).OrderByDescending(m => m.Name).Skip(skip).Take(itemsPerPage).ToList();

                    //count the total applicant data that meet the search criteria
                    dataCount = _context.Applicants.Count(m =>
                    m.Name.ToLower().Trim().Contains(searchTerm.ToLower().Trim())
                    || m.FamilyName.ToLower().Trim().Contains(searchTerm.ToLower().Trim())
                    || m.EmailAdress.Trim().Contains(searchTerm.Trim()));
                }
                else //the request is a normal get
                {
                    //use pagination to get the applicants' data
                    applicants = _context.Applicants.OrderByDescending(m => m.Id).Skip(skip).Take(itemsPerPage).ToList();
                    dataCount = _context.Applicants.Count();
                }

                if (!applicants.Any())
                {
                    dataCount = 0;
                    return new List<Applicant>();
                }

                return applicants.OrderByDescending(m => m.Name).ToList();
            }
            catch (Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger?.LogInformation(message);
                dataCount = 0;
                return new List<Applicant>();
            }
        }

    }
}
