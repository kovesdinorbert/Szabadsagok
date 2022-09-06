// See https://aka.ms/new-console-template for more information
using NBomber.Contracts;
using NBomber.CSharp;
using NBomber.Plugins.Http.CSharp;
using NBomber.Plugins.Network.Ping;

using var httpClient = new HttpClient();

var step1 = Step.Create("classic api", async context =>
{
    var response = await httpClient.GetAsync("http://localhost:62303/api/user/getallusers");

    return response.IsSuccessStatusCode
        ? Response.Ok()
        : Response.Fail();
});

var step2 = Step.Create("minimal api", async context =>
{
    var response = await httpClient.GetAsync("http://localhost:5164/api/user/getallusers");

    return response.IsSuccessStatusCode
        ? Response.Ok()
        : Response.Fail();
});

var scenario1 = ScenarioBuilder.CreateScenario("classic api", step1)
    .WithWarmUpDuration(TimeSpan.FromSeconds(5))
    .WithLoadSimulations(Simulation.KeepConstant(24, TimeSpan.FromSeconds(60)));
var scenario2 = ScenarioBuilder.CreateScenario("minimal api", step2)
    .WithWarmUpDuration(TimeSpan.FromSeconds(5))
    .WithLoadSimulations(Simulation.KeepConstant(24, TimeSpan.FromSeconds(60)));

//NBomberRunner
//    .RegisterScenarios(scenario1,scenario2)
//    .Run();
NBomberRunner
    .RegisterScenarios(scenario1)
    .Run();
NBomberRunner
    .RegisterScenarios(scenario2)
    .Run();



//var step = Step.Create("fetch_html_page",
//    clientFactory: HttpClientFactory.Create(),
//    execute: context =>
//    {
//        var request = Http.CreateRequest("GET", "http://localhost:5164/api/user/getallusers")
//            .WithHeader("Accept", "text/html");

//        return Http.Send(request, context);
//    });

//var scenario = ScenarioBuilder
//    .CreateScenario("simple_http", step)
//    .WithWarmUpDuration(TimeSpan.FromSeconds(5))
//    .WithLoadSimulations(
//        Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromSeconds(30))
//    );

//// creates ping plugin that brings additional reporting data
//var pingPluginConfig = PingPluginConfig.CreateDefault(new[] { "http://localhost:5164/api/user/getallusers" });
//var pingPlugin = new PingPlugin(pingPluginConfig);

//NBomberRunner
//    .RegisterScenarios(scenario)
//    .WithWorkerPlugins(pingPlugin)
//    .Run();

Console.ReadKey();