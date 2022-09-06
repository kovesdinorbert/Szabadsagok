using System.Reflection.Metadata.Ecma335;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<AppConfiguration>(builder.Configuration.GetSection("AppConfiguration"));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var appConfiguration = builder.Configuration.GetSection("AppConfiguration").Get<AppConfiguration>();
builder.Services.AddDbContext<SzabadsagAppContext>(x => x.UseSqlServer(connectionString));

builder.Services.AddDataProtection()
.UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
{
    EncryptionAlgorithm = "AES",
    EncryptionAlgorithmProvider = null,
    EncryptionAlgorithmKeySize = 128
});

builder.Services.RegisterAppServices();
builder.Services.AddMappings();
builder.Services.AddCors();

builder.Services.AddAuthorization(cfg => {
    cfg.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddAuthentication(opt => {
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appConfiguration.SecretKey)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});



var app = builder.Build();

app.MapGet("/api/user/getallusers", () => Results.Ok("OK") )
    .AllowAnonymous()
    .WithName("GetAllUsers");

if (app.Environment.IsDevelopment())
{
}
app.UseCors(x => x.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());


app.Run();
