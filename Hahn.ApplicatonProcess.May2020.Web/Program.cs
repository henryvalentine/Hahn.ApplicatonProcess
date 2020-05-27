using System;
using Hahn.ApplicatonProcess.May2020.Data.DataContext;
using Hahn.ApplicatonProcess.May2020.Domain.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Configuration;
using System.IO;
using Microsoft.Extensions.Logging;

namespace Hahn.ApplicatonProcess.May2020.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

            // Instantiate the Serilog logger, and configure the sinks
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)                
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .CreateLogger();


            // Wrap creating and running the host in a try-catch block
            try
            {
                Log.Information("Starting host");
                //Get the application's IHost.
                var host = CreateHostBuilder(args).Build();

                //retrieve the scoped service layer.
                using (var scope = host.Services.CreateScope())
                {
                    //Get the already instantiated ApplicantDbContext from the services layer
                    var services = scope.ServiceProvider;
                    var context = services.GetRequiredService<ApplicantDBContext>();

                    //Then use ApplicantDBInnitializer to seed sample data into the in-memory Database
                    ApplicantDBInnitializer.Initialize(services);
                }

                //Continue running the application
                host.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "A fatal error was encountered and the Host terminated unexpectedly");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .UseSerilog() //use serilog
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
