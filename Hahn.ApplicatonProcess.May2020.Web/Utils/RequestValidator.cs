using Hahn.ApplicatonProcess.May2020.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Hahn.ApplicatonProcess.May2020.Web.Utils
{
    public class RequestValidator
    {
        public long Code { get; set; }
        public string Message { get; set; }
    }

    public class QueryModel
    {
        public long TotalItems { get; set; }
        public List<Applicant> Applicants { get; set; }
    }
}
