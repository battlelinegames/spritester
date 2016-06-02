/*
*  THIS IS THE MAIN SPRITESTER CLASS, IT TAKES A CANVAS AND ADDS
*  TRIMMED IMAGES TO IT.  IT ALSO MANAGES GENERATING THE JSON
*  FILE THAT IS USED BY A GAME OR OTHER APPLICATION TO DETERMINE
*  WHERE THE IMAGES WERE PLACED.  
* 
*  TRY OUT THE APP ON http://www.spritester.com
*  
*  YOU CAN FIND TYPESCRIPT CODE THAT LOADS A TEXTURE ATLAS ON
*  MY WEBSITE:
*  http://www.typescriptgames.com
*
*  IF YOU HAVE ANY QUESTIONS, PLEASE TWEET ME @typescriptgames
*/
class SpritePacker {

    public static SINGLETON: SpritePacker = null;
    public static PADDING: number = 1;
    public canvas: HTMLCanvasElement;

    public spriteList: Array<Sprite> = new Array<Sprite>();

    public pow2: boolean = true;

    private _halfBinWidth: number = 0;

    private _packHeight: number = 0;
    private _leftHeight: number = 0;
    private _rightHeight: number = 0;

    constructor(canvas: HTMLCanvasElement) {

        if (SpritePacker.SINGLETON == null) {
            SpritePacker.SINGLETON = this;
        }
        else {
            delete this;
            return;
        }
        this.canvas = canvas;

        this.canvas.width = 256;
        this.canvas.height = 128;
        this._halfBinWidth = this.canvas.width / 2;
    }

    public CanvasPow2(pow2: boolean) {
        var right_edge: number = this._findRightEdge();
        var bottom_edge: number = this._findBottomEdge();
        this.pow2 = pow2;

        if (pow2) {
            this.canvas.width = 256;
            this.canvas.height = 128;

            while (this.canvas.width < right_edge) {
                this.canvas.width *= 2;
            }
            while (this.canvas.height < bottom_edge) {
                this.canvas.height *= 2;
            }
        }
        else {
            this.canvas.width = right_edge;
            this.canvas.height = bottom_edge;
        }
        this._halfBinWidth = this.canvas.width / 2;

    }

    private _findRightEdge(): number {
        var right_edge: number = 0;
        var s: Sprite;

        for (var i: number = 0; i < this.spriteList.length; i++) {
            s = this.spriteList[i];
            if (right_edge < s.x + s.trimmedWidth) {
                right_edge = s.x + s.trimmedWidth;
            }
        }
        return right_edge;
    }

    private _findBottomEdge(): number {
        var bottom_edge: number = 0;
        var s: Sprite;

        for (var i: number = 0; i < this.spriteList.length; i++) {
            s = this.spriteList[i];
            if (bottom_edge < s.y + s.trimmedHeight) {
                bottom_edge = s.y + s.trimmedHeight;
            }
        }
        return bottom_edge;
    }

    private _sortSpriteW = (s1: Sprite, s2: Sprite): number => {
        return s1.trimmedWidth - s2.trimmedWidth;
    }

    private _sortSpriteH = (s1: Sprite, s2: Sprite): number => {
        //return s1.trimmedHeight - s2.trimmedHeight;
        return s2.trimmedHeight - s1.trimmedHeight;
    }

    public draw = (): void => {
        var draw_sprite: Sprite;
        for (var i: number = 0; i < this.spriteList.length; i++) {
            draw_sprite = this.spriteList[i];
            draw_sprite.draw();
        }
    }

    public addSprite = (sprite: Sprite): void => {
        this.spriteList.push(sprite);
    }

    public package = (): void => {
        debugger;
        var unplaced: Array<Sprite> = this.spriteList.slice();
        unplaced.sort(this._sortSpriteW);

        if (unplaced.length > 0) {
            while (unplaced[unplaced.length - 1].width > this.canvas.width) {

                if (this.pow2) {
                    this.canvas.width *= 2;
                }
                else {
                    this.canvas.width = unplaced[unplaced.length - 1].width;
                }
                this._halfBinWidth = this.canvas.width / 2;

            }
        }

        this._packHeight = this._rightHeight = this._leftHeight = this._widthPack(unplaced);

        while (this._packHeight > this.canvas.height) {

            if (this.pow2) {
                this.canvas.height *= 2;
            }
            else {
                this.canvas.height = this._packHeight;
            }
        }

        unplaced.sort(this._sortSpriteH);

        this._heightPack(unplaced);

        while (this._packHeight > this.canvas.height) {
            if (this.pow2) {
                this.canvas.height *= 2;
            }
            else {
                this.canvas.height = this._packHeight;
            }
        }

        while (unplaced.length > 0) {
            if (this._leftHeight < this._rightHeight) {
                this._heightPackLeft(unplaced);
            }
            else {
                this._heightPackRight(unplaced);
            }
            while (this._leftHeight > this.canvas.height) {
                if (this.pow2) {
                    this.canvas.height *= 2;
                }
                else {
                    this.canvas.height = this._leftHeight;
                }
            }
            while (this._rightHeight > this.canvas.height) {
                if (this.pow2) {
                    this.canvas.height *= 2;
                }
                else {
                    this.canvas.height = this._rightHeight;
                }
            }
        }

        var jsondata: any = {};
        jsondata.frames = {};
        jsondata.meta = {};
        jsondata.meta.app = "http://www.spritester.com";
        jsondata.meta.version = "0.3";

        for (var i: number = 0; i < this.spriteList.length; i++) {
            var temp_sprite: Sprite = this.spriteList[i];
            jsondata.frames[temp_sprite.name] = new Frame(new Rectangle(temp_sprite.x, temp_sprite.y,
                                                                                                        temp_sprite.trimmedWidth,
                                                                                                        temp_sprite.trimmedHeight),//frame: Rectangle,
                                                                            new Rectangle(temp_sprite.trimRight, temp_sprite.trimTop,
                                                                                                    temp_sprite.trimmedWidth,
                                                                                                   temp_sprite.trimmedHeight),// spriteSourceSize: Rectangle,
                                                                            temp_sprite.width, //sourceW: number,
                                                                            temp_sprite.height); //sourceH: number);
        }
        // jsontxt
        var jsontxt: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("jsontxt");
        jsontxt.textContent = JSON.stringify(jsondata);
    }

    private _heightPack = (unplaced: Array<Sprite>): void => {
        unplaced.sort(this._sortSpriteH);
        var packed_width: number = 0;
        var temp_sprite: Sprite;

        for (var i: number = 0; i < unplaced.length; i++) {
            temp_sprite = unplaced[i];

            if (i == 0) {
                this._leftHeight += temp_sprite.trimmedHeight;
            }

            if (temp_sprite.trimmedWidth < this.canvas.width - packed_width) {
                temp_sprite.x = packed_width; 
                temp_sprite.y = this._packHeight;
                packed_width += temp_sprite.trimmedWidth;

                if (temp_sprite.x < this._halfBinWidth && packed_width >= this._halfBinWidth) {
                    this._rightHeight = this._packHeight + temp_sprite.trimmedHeight;
                }
                unplaced.splice(i, 1);
            }
        }
        while (this._rightHeight > this.canvas.height) {
            if (this.pow2) {
                this.canvas.height *= 2;
            }
            else {
                this.canvas.height = this._rightHeight;
            }
        }
    }

    private _heightPackLeft = (unplaced: Array<Sprite>): void => {
        var packed_width: number = 0;
        var temp_sprite: Sprite;

        var start_height: number = this._leftHeight;

        for (var i: number = 0; i < unplaced.length; i++) {
            temp_sprite = unplaced[i];

            if (i == 0) {
                this._leftHeight += temp_sprite.trimmedHeight;
            }

            if (temp_sprite.trimmedWidth < this._halfBinWidth - packed_width) {
                temp_sprite.x = packed_width;
                temp_sprite.y = start_height;
                packed_width += temp_sprite.trimmedWidth;

                unplaced.splice(i, 1);
            }
        }
        while (this._leftHeight > this.canvas.height) {
            if (this.pow2) {
                this.canvas.height *= 2;
            }
            else {
                this.canvas.height = this._leftHeight;
            }
        }
    }

    private _heightPackRight = (unplaced: Array<Sprite>): void => {
        var packed_width: number = 0;
        var temp_sprite: Sprite;

        var start_height: number = this._rightHeight;

        for (var i: number = 0; i < unplaced.length; i++) {
            temp_sprite = unplaced[i];

            if (i == 0) {
                this._rightHeight += temp_sprite.trimmedHeight;
            }

            if (temp_sprite.trimmedWidth < this._halfBinWidth - packed_width) {
                temp_sprite.x = packed_width + this._halfBinWidth;
                temp_sprite.y = start_height;
                packed_width += temp_sprite.trimmedWidth;

                unplaced.splice(i, 1);
            }
        }
        while (this._rightHeight > this.canvas.height) {
            if (this.pow2) {
                this.canvas.height *= 2;
            }
            else {
                this.canvas.height = this._rightHeight;
            }
        }
    }

    private _widthPack = (unplaced: Array<Sprite>): number => {
        var pack_height: number = 0;
        var temp_sprite: Sprite;
        if (unplaced.length == 0) {
            return;
        }
        temp_sprite = unplaced.pop();

        while (temp_sprite != null && temp_sprite.trimmedWidth >= this._halfBinWidth) {
            temp_sprite.x = 0;
            temp_sprite.y = pack_height;
            pack_height += temp_sprite.trimmedHeight;
            temp_sprite = unplaced.pop();

            while (pack_height > this.canvas.height) {
                if (this.pow2) {
                    this.canvas.height *= 2;
                }
                else {
                    this.canvas.height = pack_height ;
                }
            }
        }

        if (temp_sprite != null) {
            unplaced.push(temp_sprite);
        }

        return pack_height;
    }
}

