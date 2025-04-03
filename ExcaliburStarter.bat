@echo off

echo Welcome to the VITE/Excalibur/PEASY Bootstrapper!!!

REM Prompt the user if this is for an Itch deployment
set /p answer="Is this an Itch deployment? (type y for yes, no is default): "

if /i "%answer%"=="y" (
    set deployFlag=1
) else (
    set deployFlag=0
)

set /p lang="Enter To Begin"

echo Application Directory
echo %~dp0
chdir %~dp0
echo Current Working Directory
echo %cd%

echo Install NPM modules
call npm init -y
call npm i @peasy-lib/peasy-ui @peasy-lib/peasy-input @peasy-lib/peasy-assets
call npm i vite typescript json --save-dev
call npm i excalibur

echo copying favicon
xcopy C:\programming\favicon\ex-logo.png .


:: ************************************
:: creating file structure
:: ************************************

echo creating file structure
md src
md test
md public
md dist
cd src
md Assets
md UI
md Components
md Lib

cd Lib
echo copying Lib files
xcopy "C:\programming\Game Dev Library\CustomEmitterManager.ts" .
xcopy "C:\programming\Game Dev Library\UUID.ts" .
cd ..

md Shaders
md Actors

:: ************************************
:: Main.TS file
:: ************************************

echo creating /src/main.ts

@echo off
(
echo // main.ts
echo import './style.css';
echo.
echo import ^{ UI ^} from '@peasy-lib/peasy-ui';
echo import ^{ Engine, DisplayMode ^} from 'excalibur';
echo import ^{ model, template ^} from './UI/UI';
echo.
echo await UI.create^(document.body, model, template^).attached;
echo.
echo const game = new Engine^(^{
echo   width: 800, // the width of the canvas
echo   height: 600, // the height of the canvas
echo   canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
echo   displayMode: DisplayMode.Fixed, // the display mode
echo   pixelArt: true
echo ^}^);
echo.
echo await game.start^(^);
)>main.ts



:: ************************************
:: UI.ts file
:: ************************************
cd UI
echo creating /src/UI/UI.ts


(
echo export const model = ^{^};
echo.
echo export const template = `
echo ^<style^> 
echo     canvas^{ 
echo         position: fixed; 
echo         top:50%%; 
echo         left:50%%; 
echo         transform: translate^(-50%% , -50%%^);
echo     ^}
echo ^</style^> 
echo ^<div^> 
echo     ^<canvas id='cnv'^> ^</canvas^> 
echo ^</div^>`;
)>UI.ts

cd ..
cd ..

:: ************************************
:: TSconfig file
:: ************************************

echo creating tsconfig.json file in root

@echo off
(
echo {  
echo  "compilerOptions": { 
echo    "target": "ESNext",
echo    "useDefineForClassFields": true,
echo    "lib": ["ESNext", "DOM"],
echo    "outDir": "./build/",
echo    "sourceMap": true, 
echo    "noImplicitAny": true,
echo    "module": "ESNext",
echo    "jsx": "react",
echo    "allowJs": true,
echo    "moduleResolution": "Node",
echo    "resolveJsonModule": true,
echo    "esModuleInterop": true,
echo    "skipLibCheck": true,
echo    "isolatedModules": true,
echo    "strict": true
echo    }
echo }
)>tsconfig.json

:: ************************************
:: vite.config file
:: ************************************

echo creating vite.config.js file in root
@echo off
( 
echo import ^{ defineConfig ^} from "vite";
echo.
echo export default defineConfig^(^{
echo   base: "./",
echo build: ^{
echo target: "esnext", //browsers can handle the latest ES features 
echo ^},
echo assetsInclude:["**/*.png", "**/*.jpg", "**/*.svg", "**/*.tff"],
echo ^}^);
)>vite.config.js


:: ************************************
:: .gitignore file
:: ************************************

echo creating .gitignore file
echo node_modules>.gitignore
echo build>>.gitignore

:: ************************************
:: index.html
:: ************************************

echo creating /index.html

@echo off
(
echo ^<!DOCTYPE html^> 
echo ^<html lang="en"^>
echo. 
echo ^<head^> 
echo    ^<meta charset="UTF-8"^> 
echo    ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^> 
echo    ^<link rel="icon" type="image/x-icon" href="./ex-logo.png" /^> 
echo    ^<title^>Hello Excalibur^</title^>  
echo    ^<script type="module" src="/src/main.ts"^> ^</script^>   
echo ^</head^> 
echo.
echo ^<body^> ^</body^> 
echo.
echo ^</html^> 
)>index.html

:: ************************************
:: resources.ts
:: ************************************
cd src

echo creating /src/resources.ts

@echo off
(
    echo // resources.ts
    echo import ^{ ImageSource, Loader, Sprite, SpriteSheet ^} from "excalibur";
    echo import myImageResource from './Assets/myImage.png' // replace this
    echo.
    echo export const Resources = ^{
    echo    myImage: new ImageSource^(myImageResource^),
    echo ^};
    echo.
    echo export const loader = new Loader^(^);
    echo.
    echo for ^(let res of Object.values^(Resources^)^) ^{
    echo    loader.addResource^(res^);
    echo ^}
)>resources.ts 


:: ************************************
:: index.d.ts file
:: ************************************

echo creating /src/typs.d.ts

@echo off
(
echo //define image types here
echo.
echo declare module "*.png" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.jpg" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.svg" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.webp" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.gif" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo //audio files
echo declare module "*.mp3" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.wav" {
echo  const value: string;
echo  export default value;
echo }
echo.
echo declare module "*.ogg" {
echo  const value: string;
echo  export default value;
echo }
)>types.d.ts 

:: ************************************
:: styles.css
:: ************************************
echo creating /src/style.css

@echo off
(
echo /*style.css*/ 
echo body ^{
echo  box-sizing: border-box;
echo  padding: 0;
echo  margin: 0;
echo  line-height: 1;
echo  background-color: var^(--current-background^);
echo  color: var^(--current-foreground^);
echo ^}
echo.
echo .color1 ^{
echo  color: #131617;
echo ^}
echo .color2 ^{
echo color: #34393c;
echo ^}
echo .color3 ^{
echo  color: #5e676b;
echo ^}
echo .color4 ^{
echo  color: #929fa4;
echo ^}
echo .color5 ^{
echo  color: #d0e3e9;
echo ^}
echo.
echo  :root ^{  
echo  ^/* Dark theme *^/  
echo   --dark-background: #34393c;  
echo   --dark-dark-accent: #131617; 
echo   --dark-neutral: #5e676b; 
echo   --dark-light-accent: #929fa4;  
echo   --dark-foregeound: #d0e3e9;  
echo   ^/* Light theme *^/   
echo   --light-background: #d0e3e9; 
echo   --light-dark-accent: #131617; 
echo   --light-foregeound: #34393c; 
echo   --light-neutral: #5e676b; 
echo   --light-light-accent: #929fa4; 
echo   ^/* Defaults *^/ 
echo   --current-background: var^(--light-background^); 
echo   --current-dark-accent: var^(--light-dark-accent^); 
echo   --current-light-accent: var^(--light-light-accent^); 
echo   --current-foreground: var^(--light-foregeound^);  
echo   --current-neutral: var^(--light-neutral^); 
echo   ^} 
echo.
echo   @media ^(prefers-color-scheme: dark^) ^{ 
echo    :root ^{
echo        --current-background: var^(--dark-background^);
echo        --current-foreground: var^(--dark-foregeound^);
echo        --current-dark-accent: var^(--dark-dark-accent^);
echo        --current-light-accent: var^(--dark-light-accent^);
echo        --current-neutral: var^(--dark-neutral^);
echo    ^}
echo   ^}
)>style.css
cd ..

if "%deployFlag%"=="0" goto skipDeploy


:: ************************************
:: .github workflow files
:: ************************************

md .github

echo creating github workflows
cd .github
md workflows
cd workflows

echo making itch.io yml
@echo off
(
    echo name: Deploy
    echo.
    echo on:
    echo   push:
    echo     branches:
    echo       - main
    echo   workflow_dispatch:
    echo.
    echo env:
    echo   ITCH_USERNAME: Mookie4242
    echo   ITCH_GAME_ID: myproject-name
    echo.
    echo jobs:
    echo   deploy:
    echo     name: Upload to Itch
    echo     runs-on: ubuntu-latest
    echo     steps:
    echo       - uses: actions/checkout@v4
    echo         with:
    echo           fetch-depth: 1
    echo           submodules: true
    echo.
    echo       - name: Install dependencies
    echo         run: npm install
    echo.
    echo       - name: Build
    echo         run: npm run build
    echo.
    echo       - name: Extract version from package.json
    echo         uses: sergeysova/jq-action@v2
    echo         id: version
    echo         with:
    echo           cmd: "jq .version package.json -r"
    echo.
    echo       - uses: KikimoraGames/itch-publish@v0.0.3
    echo         with:
    echo           butlerApiKey: ^${{secrets.BUTLER_API_KEY^}}
    echo           gameData: ./dist
    echo           itchUsername: ^${{env.ITCH_USERNAME^}}
    echo           itchGameId: ^${{ env.ITCH_GAME_ID ^}}
    echo           buildChannel: itch_build
    echo           buildNumber: ^${{ steps.version.outputs.value ^}}
)>itch.yml
cd ../..

:skipDeploy


echo tweaking package.json
call npx json -I -f package.json -e "this.scripts.build='vite build'"
call npx json -I -f package.json -e "this.scripts.dev='vite'"
call npx json -I -f package.json -e "this.scripts.preview='vite preview'"
call npx json -I -f package.json -e "this.version='0.0.1'"

npm run dev
echo COMPLETED!!!!