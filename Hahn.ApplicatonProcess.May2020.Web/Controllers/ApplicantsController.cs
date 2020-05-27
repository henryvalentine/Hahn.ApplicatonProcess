using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Hahn.ApplicatonProcess.May2020.Data.Models;
using Hahn.ApplicatonProcess.May2020.Domain.Interfaces;
using Hahn.ApplicatonProcess.May2020.Web.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Hahn.ApplicatonProcess.May2020.Web.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicantsController : ControllerBase
    {
        private readonly IApplicantService _applicantService;
        private readonly IServiceProvider _services;
        private readonly ILogger<ApplicantsController> _logger;
        public ApplicantsController(IServiceProvider services, ILogger<ApplicantsController> logger = null)
        {
            _logger = logger;

            //Retrieving and re-using the scoped service since the original service will be discarded after its cycle
            _services = services;
            var scope = _services.CreateScope();
            _applicantService = scope.ServiceProvider.GetRequiredService<IApplicantService>();
        }

        /// <summary>
        /// Creates an Applicant.
        /// </summary>
        /// <remarks>
        /// Sample applicant:
        ///
        ///     POST /Applicant
        ///     {
        ///        "name": "Emery",
        ///        "familyName": "Quinn",
        ///        "address": "47 Oak Bridge, Westbrae, Munchen",
        ///        "emailAdress": "emeryammond@hahn.de",
        ///        "countryOfOrigin": "Germany",
        ///        "age": 25,
        ///        "hired": true
        ///     }
        ///
        /// </remarks>
        /// <param name="applicant"></param>
        /// <returns>A feedback message object with code and message</returns>
        /// <response code="201">A feedback message object with code and message</response>
        /// <response code="400">If the Applicant is null or fails validation</response>            
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]       
        [Route("addApplicant")]
        public ActionResult<RequestValidator> AddApplicant([FromBody]Applicant applicant)
        {
            //used to return feedback to the user
            var gVal = new RequestValidator();
            try
            {               
                if (string.IsNullOrEmpty(applicant.Name))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide applicant's Name.";
                    return gVal;
                }

                if (applicant.Name.Length < 5)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Name must not be less than 5 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.FamilyName))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide applicant's Family Name.";
                    return gVal;
                }

                if (applicant.FamilyName.Length < 5)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Family Name must not be less than 5 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.EmailAdress))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Email Address.";
                    return gVal;
                }

                if (!applicant.EmailAdress.Contains('@'))
                {
                    gVal.Code = -1;
                    gVal.Message = "The provided Email Address is invalid.";
                    return gVal;
                }

                //validate if the email Address is actually valid, not just checking if it contains the '@' character   
                //using the in-built .net System.ComponentModel.DataAnnotations
                var isvalidEmail = new EmailAddressAttribute().IsValid(applicant.EmailAdress);
                if (!isvalidEmail)
                {
                    gVal.Code = -1;
                    gVal.Message = "The provided Email Address is invalid.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.Address))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Address.";
                    return gVal;
                }

                if (applicant.Address.Length < 10)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Address must not be less than 10 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.CountryOfOrigin))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Country Of Origin.";
                    return gVal;
                }

                if (applicant.Age < 20 || applicant.Age > 60)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Age must fall between 20 and 60 years";
                    return gVal;
                }

                var status = _applicantService.AddApplicant(applicant);
                if (status < 1)
                {
                    gVal.Code = -1;
                    gVal.Message = status == -3 ? "applicant record already exists" : "An unknown error was encountered. Please try again.";
                    return gVal;
                }

                gVal.Code = status;
                gVal.Message = "Applicant information was successfully Added";
                return gVal;

            }
            catch (Exception ex)
            {
                gVal.Code = -1;
                gVal.Message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";

                _logger.LogInformation(gVal.Message);

                return gVal;
            }

        }

        /// <summary>
        /// Updates an Applicant.
        /// </summary>       
        /// <param name="applicant"></param>
        /// <returns>A feedback message object with code and message</returns>
        /// <response code="201">Returns the newly created item</response>
        /// <response code="400">If the item is null</response>
        [HttpPut]
        [Route("updateApplicant")]
        public ActionResult<RequestValidator> UpdateApplicant([FromBody]Applicant applicant)
        {
            //used to return feedback to the user
            var gVal = new RequestValidator();
            try
            {
                if (applicant.Id < 1)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant data is invalid. Please refresh the page and try again.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.Name))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide applicant's Name.";
                    return gVal;
                }

                if (applicant.Name.Length < 5)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Name must not be less than 5 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.FamilyName))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide applicant's Family Name.";
                    return gVal;
                }

                if (applicant.FamilyName.Length < 5)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Family Name must not be less than 5 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.EmailAdress))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Email Address.";
                    return gVal;
                }

                if (!applicant.EmailAdress.Contains('@'))
                {
                    gVal.Code = -1;
                    gVal.Message = "The provided Email Address is invalid.";
                    return gVal;
                }

                //validate if the email Address is actually valid, not just checking if it contains the '@' character   
                //using the in-built .net System.ComponentModel.DataAnnotations
                var isvalidEmail = new EmailAddressAttribute().IsValid(applicant.EmailAdress);
                if (!isvalidEmail)
                {
                    gVal.Code = -1;
                    gVal.Message = "The provided Email Address is invalid.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.Address))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Address.";
                    return gVal;
                }

                if (applicant.Address.Length < 10)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant's Address must not be less than 10 characters.";
                    return gVal;
                }

                if (string.IsNullOrEmpty(applicant.CountryOfOrigin))
                {
                    gVal.Code = -1;
                    gVal.Message = "Please provide Applicant's Country Of Origin.";
                    return gVal;
                }

                if (applicant.Age < 20 || applicant.Age > 60)
                {
                    gVal.Code = -1;
                    gVal.Message = "Applicant Age must fall between 20 and 60 years";
                    return gVal;
                }

                var status = _applicantService.UpdateApplicant(applicant);
                if (status < 1)
                {
                    gVal.Code = -1;
                    gVal.Message = status == -3 ? "applicant record already exists" : "An unknown error was encountered. Please try again.";
                    return gVal;
                }

                gVal.Code = status;
                gVal.Message = "Applicant information was successfully updated";
                return gVal;

            }
            catch (Exception ex)
            {
                gVal.Code = -1;
                gVal.Message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger.LogInformation(gVal.Message);
                return gVal;
            }
        }

        /// <summary>
        /// Deletes an Applicant's data.
        /// </summary>
        /// <param name="applicantId"></param>    
        [HttpDelete("deleteApplicant")]
        public RequestValidator DeleteApplicant(int applicantId)
        {
            try
            {
                //used to return feedback to the user
                var gVal = new RequestValidator();

                var status = _applicantService.DeleteApplicant(applicantId);
                if (status < 1)
                {
                    gVal.Code = -1;
                    gVal.Message = status == -3 ? "applicant record could not be found" : "An unknown error was encountered. Please try again.";
                }
                else
                {
                    gVal.Code = status;
                    gVal.Message = "applicant record was successfully deleted.";
                }

                return gVal;
            }
            catch (Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger.LogInformation(message);
                return new RequestValidator { Message = message, Code = -1 };
            }
            
        }

        /// <summary>
        /// Retrieves an Applicants list with server-sidde pagination and with or without a search
        /// term specified
        /// </summary>
        /// <param name="itemsPerPage"></param>   
        /// /// <param name="pageNumber"></param>   
        /// /// <param name="searchTerm"></param>   
        [HttpGet]
        [Route("getApplicants")]
        public ActionResult<QueryModel> GetApplicants(int itemsPerPage, int pageNumber, string searchTerm = null)
        {
            try 
            {
                //get applicants list
                int dataCount;
                var applicants = _applicantService.GetApplicants(itemsPerPage, pageNumber, out dataCount, searchTerm);
                return new QueryModel { Applicants = applicants, TotalItems = dataCount };
            }
            catch(Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger.LogInformation(message);            
                return new QueryModel { Applicants = new List<Applicant>(), TotalItems = 0 };
            }
            
        }

        /// <summary>
        /// Retrieves an Applicant by Id.
        /// </summary>
        /// <param name="applicantId"></param> 
        [HttpGet]
        [Route("getApplicant")]
        public ActionResult<Applicant> GetApplicant(int applicantId)
        {
            try
            {
                var applicant = _applicantService.GetApplicantById(applicantId);
                return applicant;
            }
            catch (Exception ex)
            {
                var message = ex.Message != null ? ex.Message + "\n" + ex.StackTrace : ex.InnerException != null ? ex.InnerException.Message + "\n" + ex.StackTrace : "An unknown error was encountered. Please try again.";
                _logger.LogInformation(message);
                return new Applicant();
            }
            
        }
    }
}
