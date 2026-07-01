using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Knitnet.Shared.Settings;
using Knitnet.UserApi.Data;
using Knitnet.UserApi.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────
builder.Services.AddDbContext<UserDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Settings ────────────────────────────────────────────────
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<SupabaseSettings>(builder.Configuration.GetSection("SupabaseSettings"));
builder.Services.Configure<VerificationSettings>(builder.Configuration.GetSection("VerificationSettings"));

// ─── JWT Auth ────────────────────────────────────────────────
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

// ─── Services ────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IVerificationService, VerificationService>();
builder.Services.AddScoped<IStorageService, SupabaseStorageService>();
builder.Services.AddScoped<IStudentResultService, StudentResultService>();
builder.Services.AddScoped<ISnapshotService, SnapshotService>();
// Shared services (FIX 1 & FIX 2)
builder.Services.AddScoped<Knitnet.Shared.Services.ICompanyProvisionService, Knitnet.Shared.Services.CompanyProvisionService>();
builder.Services.AddScoped<Knitnet.Shared.Services.IJwtTokenService, Knitnet.Shared.Services.JwtTokenService>();
// Background jobs (FIX 4)
builder.Services.AddHostedService<SnapshotCleanupService>();
builder.Services.AddHttpClient("Supabase");

// ─── CORS ────────────────────────────────────────────────────
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
