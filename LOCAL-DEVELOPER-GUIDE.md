# Element Finder Local Developer Guide

This is the simple local-machine setup for a manual Element Finder install.

Follow it exactly for a repeatable local setup.

## What You Need

1. An Umbraco 17 site running on `.NET 10`
2. This Element Finder repository
3. Node/npm installed
4. A local build of the plugin DLL and backoffice assets

## Folder Summary

Build from these folders in the Element Finder repo:

1. `src/Pixelbuilders.Umbraco.Package`
2. `src/Pixelbuilders.Umbraco.ElementFinder.Core`

Copy files into these folders in your Umbraco site:

1. `bin`
2. `App_Plugins/Pixelbuilders.Umbraco.ElementFinder`

## One-Time Change In The Umbraco Site

As your Umbraco site is using a manually copied plugin DLL, add this to `Program.cs` before `builder.CreateUmbracoBuilder()`.

```csharp
using System.Reflection;
using System.Runtime.Loader;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string manualPluginBinPath = Path.Combine(builder.Environment.ContentRootPath, "bin");
List<Assembly> manualPluginAssemblies = [];
if (Directory.Exists(manualPluginBinPath))
{
    HashSet<string> loadedAssemblyNames = AppDomain.CurrentDomain
        .GetAssemblies()
        .Select(assembly => assembly.GetName().Name)
        .OfType<string>()
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    foreach (string assemblyPath in Directory.EnumerateFiles(manualPluginBinPath, "*.dll", SearchOption.TopDirectoryOnly))
    {
        string? assemblyName = Path.GetFileNameWithoutExtension(assemblyPath);
        if (string.IsNullOrWhiteSpace(assemblyName) || loadedAssemblyNames.Contains(assemblyName))
        {
            continue;
        }

        try
        {
            Assembly assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(assemblyPath);
            manualPluginAssemblies.Add(assembly);
            loadedAssemblyNames.Add(assemblyName);
        }
        catch (FileLoadException)
        {
        }
        catch (BadImageFormatException)
        {
        }
    }
}

foreach (Assembly manualPluginAssembly in manualPluginAssemblies)
{
    builder.Services
        .AddControllers()
        .PartManager
        .ApplicationParts
        .Add(new AssemblyPart(manualPluginAssembly));
}
```

Why this matters:

`dotnet run` does not automatically treat a manually copied plugin DLL as part of the app dependency graph. Without this preload step, the DLL can exist in `bin` but the API route still will not register.

Loading the DLL is not enough on its own. The assembly also needs to be added to MVC application parts so ASP.NET Core can discover controllers inside the plugin.

## Build The Plugin

### 1. Build the backoffice files

From `src/Pixelbuilders.Umbraco.Package`:

```powershell
npm install
npm run build
```

### 2. Build the DLL

From `src/Pixelbuilders.Umbraco.ElementFinder.Core`:

```powershell
dotnet build -c Release
```

## Copy The Built Files Into Umbraco

Copy these files from the Element Finder repo:

1. `src/Pixelbuilders.Umbraco.ElementFinder.Core/bin/Release/net10.0/Pixelbuilders.Umbraco.ElementFinder.Core.dll`
2. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/element-finder.js`
3. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/element-finder.js.map`
4. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/umbraco-package.json`

Copy them into your Umbraco site as:

1. `bin/Pixelbuilders.Umbraco.ElementFinder.Core.dll`
2. `App_Plugins/Pixelbuilders.Umbraco.ElementFinder/element-finder.js`
3. `App_Plugins/Pixelbuilders.Umbraco.ElementFinder/element-finder.js.map`
4. `App_Plugins/Pixelbuilders.Umbraco.ElementFinder/umbraco-package.json`

## Run The Site

From the Umbraco site root:

```powershell
dotnet run
```

Then:

1. Sign into Umbraco backoffice
2. Hard refresh the browser (open devtools first if required)
3. Open the Element Finder dashboard in Content and confirm the drop-down loads document/element types


## Quick Checks If It Breaks

### The dashboard loads but the type list is empty

Check the browser dev tools network tab for:

`/umbraco/element-finder/api/v1/all-types`

### If that request returns `404`

Usually one of these is wrong:

1. The Umbraco site's `Program.cs` does not include the code block from `One-Time Change In The Umbraco Site`
2. The wrong DLL was copied into `bin`
3. The site was not restarted after copying the DLL
4. The DLL was loaded but not registered as an MVC application part

### If that request returns `401`

That is expected for anonymous requests. It means the route exists and is protected.

### If the request succeeds but the results are wrong

You are past the loading problem. The next place to check is the plugin code or the returned data.

## Recommended Team Workflow

1. Keep one copy of this guide with the plugin repo
2. Apply the `One-Time Change In The Umbraco Site` `Program.cs` code block once per local Umbraco site
3. Treat the plugin as two deployables: the DLL and the `App_Plugins` files
4. Whenever someone pulls a plugin change, rebuild, recopy, restart, and hard refresh
