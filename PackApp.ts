///<reference path="./includes.ts"/>

/*
*   SPRITESTER IS AN HTML5 WEB APP THAT ALLOWS A USER TO GENERATE A TEXTURE ATLAS
* FROM A WEB BROWSER.  I'M RELEASING IT UNDER THE MIT LICENSE AND DOCUMENTING IT 
* ON MY WEBSITE typescriptgames.com
* 
*  TRY OUT THE APP ON http://www.spritester.com
*  
*  YOU CAN FIND TYPESCRIPT CODE THAT LOADS A TEXTURE ATLAS ON
*  MY WEBSITE:
*  http://www.typescriptgames.com
*
*  IF YOU HAVE ANY QUESTIONS, PLEASE TWEET ME @typescriptgames
*/


var ctx: CanvasRenderingContext2D;

var renderPNG: boolean = false;
var readyToRender: boolean = false;
var renderCallback: () => void;

function renderSetup(callback: () => void ): void {
    renderPNG = true;
    readyToRender = true;
    renderCallback = callback;
}

function gameLoop(): void {
    requestAnimationFrame(gameLoop);

    if (renderPNG == false) {
        ctx.fillStyle = "magenta";
        ctx.fillRect(0, 0, SpritePacker.SINGLETON.canvas.width, SpritePacker.SINGLETON.canvas.height);
    }
    else {
        ctx.clearRect(0, 0, SpritePacker.SINGLETON.canvas.width, SpritePacker.SINGLETON.canvas.height);
        if (readyToRender == true) {
            SpritePacker.SINGLETON.draw();
            readyToRender = false;
            renderCallback();
            return;
        }
    }
    SpritePacker.SINGLETON.draw();
}

window.onload = () => {
    var sprite_packer: SpritePacker = new SpritePacker(<HTMLCanvasElement>document.getElementById("atlascanvas"));
    ctx = SpritePacker.SINGLETON.canvas.getContext("2d");
    gameLoop();
}

/*
LIST OF POSSIBLE ALGORITHMS TO USE
Sleator's algorithm
Split-Fit algorithm (SF)
Steinberg's algorithm
Reverse-fit (RF) algorithm
Baker's Up-Down (UD) algorithm
Bottom-Left (BL) Algorithm
Best-Fit Decreasing Height (BFDH) algorithm
Next-Fit Decreasing Height (NFDH) algorithm
First-Fit Decreasing Height (FFDH) algorithm
*/