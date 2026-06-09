# RL Pixelbuilders Umbraco Element Finder Build and Deploy Guide

This guide explains how to build the extension and which files to copy into your Umbraco site.

## Target Umbraco Folder Layout

Plugin folder in your Umbraco site:

- `C:/DEV/Retirement Line/RL Umbraco 17/MAIN/App_Plugins/RL_PixelbuildersUmbracoElementFinder`

DLL name:

- `RL_PixelbuildersUmbracoElementFinder.Core.dll`

## Build Steps

### 1. Build the backoffice bundle (JavaScript)

From the repository root:

```powershell
Set-Location "src/Pixelbuilders.Umbraco.Package"
npm install
npm run build
```

This writes the built plugin files into:

- `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot`

### 2. Build the .NET assembly (DLL)

From the repository root:

```powershell
Set-Location "src"
dotnet build "Pixelbuilders.Umbraco.ElementFinder.Core/Pixelbuilders.Umbraco.ElementFinder.Core.csproj" -c Release
```

This produces:

- `src/Pixelbuilders.Umbraco.ElementFinder.Core/bin/Release/net10.0/RL_PixelbuildersUmbracoElementFinder.Core.dll`

## Files To Copy

Copy these files from this repository:

1. `src/Pixelbuilders.Umbraco.ElementFinder.Core/bin/Release/net10.0/RL_PixelbuildersUmbracoElementFinder.Core.dll`
2. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/element-finder.js`
3. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/umbraco-package.json`
4. `src/Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot/element-finder.js.map` (optional)

Copy them into your Umbraco site here:

1. `App_Plugins/RL_PixelbuildersUmbracoElementFinder/RL_PixelbuildersUmbracoElementFinder.Core.dll`
2. `App_Plugins/RL_PixelbuildersUmbracoElementFinder/element-finder.js`
3. `App_Plugins/RL_PixelbuildersUmbracoElementFinder/umbraco-package.json`
4. `App_Plugins/RL_PixelbuildersUmbracoElementFinder/element-finder.js.map` (optional)

## Manifest Path Check

Confirm your deployed `umbraco-package.json` contains:

```json
{
  "extensions": [
    {
      "type": "backofficeEntryPoint",
      "alias": "RL_PixelbuildersUmbracoElementFinder.EntryPoint",
      "js": "/App_Plugins/RL_PixelbuildersUmbracoElementFinder/element-finder.js"
    }
  ]
}
```

## Final Verification

1. Restart your Umbraco site.
2. Hard refresh the backoffice browser tab.
3. Open Content > Element Finder dashboard.
4. Confirm there are no 404 errors for `element-finder.js`.
