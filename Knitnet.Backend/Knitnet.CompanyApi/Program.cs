using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Knitnet.Shared.Settings;
using Knitnet.CompanyApi.Data;
using Knitnet.CompanyApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CompanyDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true,
        ValidateLifetime = true, ValidateIssuerSigningKey = true,
        ValidIssuer = jwt.Issuer, ValidAudience = jwt.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey))
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<ICompanyProfileService, CompanyProfileService>();
builder.Services.AddScoped<IHRService, HRService>();
builder.Services.AddScoped<ITestService, TestService>();
builder.Services.AddScoped<IMappingService, MappingService>();
builder.Services.AddScoped<IResultService, ResultService>();
builder.Services.AddScoped<ICreditPointService, CreditPointService>();
// Shared services (FIX 2)
builder.Services.AddScoped<Knitnet.Shared.Services.IJwtTokenService, Knitnet.Shared.Services.JwtTokenService>();

builder.Services.AddCors(o => o.AddPolicy("AllowFrontend", p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger(); app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
