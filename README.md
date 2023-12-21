# GeoLiveDetect

In order to use this project on __Windows 10__ :
1. Install Visual Studio 2022 : [Visual Studio Installer](https://visualstudio.microsoft.com/fr/thank-you-downloading-visual-studio/?sku=Community&channel=Release&version=VS2022&source=VSLandingPage&passive=false&cid=2030)

<img src=".\DOC\configVS.PNG"/>

Setup the installation in order to install developpement desktops of
- __.NET 8.0__ with default setup plus MSIX Packaging Tools
- __C++__ with default setup
- __C# platforms__ with default setup

<img src=".\DOC\configVS.NET.PNG" alt="configVS.NET" width="32%" align='top'/> <img src=".\DOC\configVS.Cpp.PNG" width="32%" align='top'/> <img src=".\DOC\configVS.Csharp.PNG" width="32%" align='top'/>

2. Download and unzip the repo folder
3. In the main folder `GeoLiveDectect-master`, find the solution `GeoLiveDectect.sln` and open it with Visual Studio 2022

4. In __GeoLiveDectect NuGet Packages__ (GeoLiveDectect project tab), check that are installed :
- `CommandLineParser` by gsscoder,nemec,ericnewton76,moh-hassan
- `Emgu.CV` by Emgu Corporation,
- `Emgu.CV.Bitmap` by Emgu Corporation,
- `Emgu.CV.runtime.windows` by Emgu Corporation,
- `Newtonsoft.Json` by James Newton-King,
- `OnnxSharp` by nietras,
- `YoloV8.Gpu` by Compunet

5. In __MOT.CORE NuGet Packages__ (MOT.CORE project tab), check that are installed :
- `CommandLineParser` by gsscoder,nemec,ericnewton76,moh-hassan
- `Microsoft.ML.OnnxRuntime` by Microsoft,
- `System.Drawing.Common` by Microsoft,
- `YoloV8.Gpu` by Compunet

6. For each project in the solution :
- In __Project properties__ (Project tab), check that
    - Target framework is __.NET 8.0__
    - Target SE is __Windows__
    - Target SE version is __7.0__
- In __Project dependancies__ (Project tab), check all other projects

7. Generate the solution to update all dependencies