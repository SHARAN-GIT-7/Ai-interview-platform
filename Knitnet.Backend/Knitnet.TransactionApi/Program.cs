using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Knitnet.Shared.Settings;
using Knitnet.TransactionApi.Data;
using Knitnet.TransactionApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TransactionDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<RazorpaySettings>(builder.Configuration.GetSection("RazorpaySettings"));

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

builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<ICreditService, CreditService>();
builder.Services.AddScoped<IRazorpayService, RazorpayService>();
builder.Services.AddHttpClient("Razorpay");

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
