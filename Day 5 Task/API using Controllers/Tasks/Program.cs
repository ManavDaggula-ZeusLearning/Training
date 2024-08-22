using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Sheets.Model;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<SheetsContext>(opt =>
    opt.UseMySQL("server=localhost;database=task5;user=root;password=root"));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "../../frontend_plain_excel")),
    RequestPath = "/frontend"
});

app.UseAuthorization();

app.MapControllers();

app.Run();
