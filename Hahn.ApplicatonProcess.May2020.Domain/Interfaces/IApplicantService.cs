using Hahn.ApplicatonProcess.May2020.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Hahn.ApplicatonProcess.May2020.Domain.Interfaces
{
    public interface IApplicantService
    {
        long AddApplicant(Applicant applicant);
        long UpdateApplicant(Applicant applicant);
        int DeleteApplicant(int applicantId);
        Applicant GetApplicantByEmail(string email);
        Applicant GetApplicantById(int applicantId);
        List<Applicant> GetApplicants(int itemsPerPage, int pageNumber, out int dataCount, string searchTerm);
    }
}
