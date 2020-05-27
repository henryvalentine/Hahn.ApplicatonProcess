# Hahn.ApplicatonProcess
 Hahn-Softwareentwicklung software interview test
 
 ## Packages Used
 
### For Hahn.ApplicatonProcess.May2020.Data:
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.Tools
- Microsoft.EntityFrameworkCore.Design
- Microsoft.EntityFrameworkCore.SqlServer 
- Microsoft.EntityFrameworkCore.InMemory

### For Hahn.ApplicatonProcess.May2020.Web:
- Serilog.AspNetCore
- Serilog.Sinks.Console
- Serilog.Sinks.Seq
- Swashbuckle.AspNetCore

- To restore the node packages, open gitbash or commandline interface and cd into Hahn.ApplicatonProcess.May2020.Web\ClientApp. Then type

yarn

and press Enter

- If there is the need to build the front end only, then use 'yarn run build' on gitbash/CLI within the ClientApp folder
 
-	This application was built using .Net Core 3.1, React.Js and TypeScript.
-	The react components are from https://ant.design/
-	The front end react components are located in Hahn.ApplicatonProcess.May2020.Web\ClientApp\src\components
-	The TypeScript configuration options are located in Hahn.ApplicatonProcess.May2020.Web\ClientApp\tsconfig.json with hotmodule reload enabled by the "compileOnSave": true
-	To ensure the application uses the tsconfig.json file, right-click on this file and click on “Properties”. On the Properties window, select ‘TypeScript File’ on the ‘Build Action’ options
-	On the Applicants.tsx file, formRef = React.createRef<FormInstance>(); is used as a ref on the Form so as to be able to monitor events on form fields for proper validation and for meeting all the conditions specified for this Test
-	I would have added user authentication functionalities but being that the in-memory database is very volatile, I had to leave it for now
-	The back end codes use service interface to create interaction between Hahn.ApplicatonProcess.May2020.Web and Hahn.ApplicatonProcess.May2020.Domain, while the model and Dbcontext reside in Hahn.ApplicatonProcess.May2020.Data.
-	There is a class file (ApplicantDBInnitializer) that checks if the database contains any records on start up. If no records are found, a sample data is then into the database:
                new Applicant
                        {
                            	Id = 1,
                            	Name = "Tobias",
                            	FamilyName = "Bodmann",
Address = "Friedhofstraße 11, 93142 Maxhütte-Haidhof,  Germany",
                            EmailAdress = "karriere@hahn-softwareentwicklung.de",
                            Age = 28,
                            CountryOfOrigin = "Germany",
                            Hired = true
                }

-	Proper validations are done at the backend when creating or updating an Appllicant and expressive feedback are returned to the user

- Logging is done on Hahn.ApplicatonProcess.May2020.Web using serilog with the options loaded from appsettings.json

- The API documentation is handled with Swashbuckle and can be. A clickable link to view the documentaion is provided at the Application's page 
