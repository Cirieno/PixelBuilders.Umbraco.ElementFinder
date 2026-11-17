# RL Element Finder

RL Element Finder adds a Content dashboard and a document-type Usage view for finding usages of types.

This guide describes copying files from the RL Umbraco CMS project, where `ManualPluginBootstrap.cs` and `cms-rl.csproj` are maintained. To build the plugin in this source repository, see the [build and deploy guide](./readme_2.md). The CMS site and this repository's `Umbraco.Cms.Api.Management` and `@umbraco-cms/backoffice` references use 17.8.2. The npm dependency is pinned to keep it aligned with the CMS.

## Installing in another Umbraco site

Copy these files into the same relative paths in the target web project:

```text
App_Plugins/RL_PixelbuildersUmbracoElementFinder/umbraco-package.json
App_Plugins/RL_PixelbuildersUmbracoElementFinder/element-finder.js
App_Plugins/RL_PixelbuildersUmbracoElementFinder/RL_PixelbuildersUmbracoElementFinder.Core.dll
ManualPluginBootstrap.cs
```

`element-finder.js.map` is optional browser-debugging information.

Merge the `Content Include` item for the RL DLL from this project's `cms-rl.csproj` into the target web project's `.csproj`. Its `TargetPath` and copy settings put the assembly in the application output directory, where `ManualPluginBootstrap` loads it. Merge `ManualPluginBootstrap.Configure(builder.Services);` into the target `Program.cs` after creating the builder and before `CreateUmbracoBuilder()`. Do not replace the target project or startup files, and do not register a second copy of the original Element Finder package.

Build, deploy the application and plugin assets, restart it and reload the backoffice. This version targets Umbraco 17.8.2. In an authenticated backoffice, check the Content dashboard and document-type Usage view, including a type with no results and a type with results.
