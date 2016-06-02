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
var SpritePacker = (function () {
    function SpritePacker(canvas) {
        var _this = this;
        this.spriteList = new Array();
        this.pow2 = true;
        this._halfBinWidth = 0;
        this._packHeight = 0;
        this._leftHeight = 0;
        this._rightHeight = 0;
        this._sortSpriteW = function (s1, s2) {
            return s1.trimmedWidth - s2.trimmedWidth;
        };
        this._sortSpriteH = function (s1, s2) {
            //return s1.trimmedHeight - s2.trimmedHeight;
            return s2.trimmedHeight - s1.trimmedHeight;
        };
        this.draw = function () {
            var draw_sprite;
            for (var i = 0; i < _this.spriteList.length; i++) {
                draw_sprite = _this.spriteList[i];
                draw_sprite.draw();
            }
        };
        this.addSprite = function (sprite) {
            _this.spriteList.push(sprite);
        };
        this.package = function () {
            debugger;
            var unplaced = _this.spriteList.slice();
            unplaced.sort(_this._sortSpriteW);
            if (unplaced.length > 0) {
                while (unplaced[unplaced.length - 1].width > _this.canvas.width) {
                    if (_this.pow2) {
                        _this.canvas.width *= 2;
                    }
                    else {
                        _this.canvas.width = unplaced[unplaced.length - 1].width;
                    }
                    _this._halfBinWidth = _this.canvas.width / 2;
                }
            }
            _this._packHeight = _this._rightHeight = _this._leftHeight = _this._widthPack(unplaced);
            while (_this._packHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._packHeight;
                }
            }
            unplaced.sort(_this._sortSpriteH);
            _this._heightPack(unplaced);
            while (_this._packHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._packHeight;
                }
            }
            while (unplaced.length > 0) {
                if (_this._leftHeight < _this._rightHeight) {
                    _this._heightPackLeft(unplaced);
                }
                else {
                    _this._heightPackRight(unplaced);
                }
                while (_this._leftHeight > _this.canvas.height) {
                    if (_this.pow2) {
                        _this.canvas.height *= 2;
                    }
                    else {
                        _this.canvas.height = _this._leftHeight;
                    }
                }
                while (_this._rightHeight > _this.canvas.height) {
                    if (_this.pow2) {
                        _this.canvas.height *= 2;
                    }
                    else {
                        _this.canvas.height = _this._rightHeight;
                    }
                }
            }
            var jsondata = {};
            jsondata.frames = {};
            jsondata.meta = {};
            jsondata.meta.app = "http://www.spritester.com";
            jsondata.meta.version = "0.3";
            for (var i = 0; i < _this.spriteList.length; i++) {
                var temp_sprite = _this.spriteList[i];
                jsondata.frames[temp_sprite.name] = new Frame(new Rectangle(temp_sprite.x, temp_sprite.y, temp_sprite.trimmedWidth, temp_sprite.trimmedHeight), //frame: Rectangle,
                new Rectangle(temp_sprite.trimRight, temp_sprite.trimTop, temp_sprite.trimmedWidth, temp_sprite.trimmedHeight), // spriteSourceSize: Rectangle,
                temp_sprite.width, //sourceW: number,
                temp_sprite.height); //sourceH: number);
            }
            // jsontxt
            var jsontxt = document.getElementById("jsontxt");
            jsontxt.textContent = JSON.stringify(jsondata);
        };
        this._heightPack = function (unplaced) {
            unplaced.sort(_this._sortSpriteH);
            var packed_width = 0;
            var temp_sprite;
            for (var i = 0; i < unplaced.length; i++) {
                temp_sprite = unplaced[i];
                if (i == 0) {
                    _this._leftHeight += temp_sprite.trimmedHeight;
                }
                if (temp_sprite.trimmedWidth < _this.canvas.width - packed_width) {
                    temp_sprite.x = packed_width;
                    temp_sprite.y = _this._packHeight;
                    packed_width += temp_sprite.trimmedWidth;
                    if (temp_sprite.x < _this._halfBinWidth && packed_width >= _this._halfBinWidth) {
                        _this._rightHeight = _this._packHeight + temp_sprite.trimmedHeight;
                    }
                    unplaced.splice(i, 1);
                }
            }
            while (_this._rightHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._rightHeight;
                }
            }
            while (_this._leftHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._leftHeight;
                }
            }
            if (_this._leftHeight > _this._packHeight) {
                _this._packHeight = _this._leftHeight;
            }
            if (_this._rightHeight > _this._packHeight) {
                _this._packHeight = _this._rightHeight;
            }
        };
        this._heightPackLeft = function (unplaced) {
            var packed_width = 0;
            var temp_sprite;
            var start_height = _this._leftHeight;
            for (var i = 0; i < unplaced.length; i++) {
                temp_sprite = unplaced[i];
                if (i == 0) {
                    _this._leftHeight += temp_sprite.trimmedHeight;
                }
                if (temp_sprite.trimmedWidth < _this._halfBinWidth - packed_width) {
                    temp_sprite.x = packed_width;
                    temp_sprite.y = start_height;
                    packed_width += temp_sprite.trimmedWidth;
                    unplaced.splice(i, 1);
                }
            }
            while (_this._leftHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._leftHeight;
                }
            }
        };
        this._heightPackRight = function (unplaced) {
            var packed_width = 0;
            var temp_sprite;
            var start_height = _this._rightHeight;
            for (var i = 0; i < unplaced.length; i++) {
                temp_sprite = unplaced[i];
                if (i == 0) {
                    _this._rightHeight += temp_sprite.trimmedHeight;
                }
                if (temp_sprite.trimmedWidth < _this._halfBinWidth - packed_width) {
                    temp_sprite.x = packed_width + _this._halfBinWidth;
                    temp_sprite.y = start_height;
                    packed_width += temp_sprite.trimmedWidth;
                    unplaced.splice(i, 1);
                }
            }
            while (_this._rightHeight > _this.canvas.height) {
                if (_this.pow2) {
                    _this.canvas.height *= 2;
                }
                else {
                    _this.canvas.height = _this._rightHeight;
                }
            }
        };
        this._widthPack = function (unplaced) {
            var pack_height = 0;
            var temp_sprite;
            if (unplaced.length == 0) {
                return;
            }
            temp_sprite = unplaced.pop();
            while (temp_sprite != null && temp_sprite.trimmedWidth >= _this._halfBinWidth) {
                temp_sprite.x = 0;
                temp_sprite.y = pack_height;
                pack_height += temp_sprite.trimmedHeight;
                temp_sprite = unplaced.pop();
                while (pack_height > _this.canvas.height) {
                    if (_this.pow2) {
                        _this.canvas.height *= 2;
                    }
                    else {
                        _this.canvas.height = pack_height;
                    }
                }
            }
            if (temp_sprite != null) {
                unplaced.push(temp_sprite);
            }
            return pack_height;
        };
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
    SpritePacker.prototype.CanvasPow2 = function (pow2) {
        var right_edge = this._findRightEdge();
        var bottom_edge = this._findBottomEdge();
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
    };
    SpritePacker.prototype._findRightEdge = function () {
        var right_edge = 0;
        var s;
        for (var i = 0; i < this.spriteList.length; i++) {
            s = this.spriteList[i];
            if (right_edge < s.x + s.trimmedWidth) {
                right_edge = s.x + s.trimmedWidth;
            }
        }
        return right_edge;
    };
    SpritePacker.prototype._findBottomEdge = function () {
        var bottom_edge = 0;
        var s;
        for (var i = 0; i < this.spriteList.length; i++) {
            s = this.spriteList[i];
            if (bottom_edge < s.y + s.trimmedHeight) {
                bottom_edge = s.y + s.trimmedHeight;
            }
        }
        return bottom_edge;
    };
    SpritePacker.SINGLETON = null;
    SpritePacker.PADDING = 1;
    return SpritePacker;
})();
/*
*  THE SPRITE CLASS REPRESENTS AN IMAGE ADDED TO THE APP.  IT KEEPS TRACK OF IT'S
*  X AND Y POSITION INSIDE THE CANVAS.  IT ALSO KEEPS TRACK OF HOW MUCH TRIMMING
*  THE APP HAS TO DO TO PLACE THIS IMAGE WITHIN THE PACKED CANVAS.
*
*  YOU CAN FIND TYPESCRIPT CODE THAT LOADS A TEXTURE ATLAS ON
*  MY WEBSITE:
*  http://www.typescriptgames.com
*
*  IF YOU HAVE ANY QUESTIONS, PLEASE TWEET ME @typescriptgames
*/
var Sprite = (function () {
    function Sprite(image) {
        var _this = this;
        this.x = 0;
        this.y = 0;
        this.name = "";
        this.offsetX = function () {
            return _this.x - _this.trimLeft;
        };
        this.offsetY = function () {
            return _this.y - _this.trimTop;
        };
        this.trimLeft = 0;
        this.trimRight = 0;
        this.trimTop = 0;
        this.trimBottom = 0;
        this.width = 0;
        this.height = 0;
        this.trimmedWidth = 0;
        this.trimmedHeight = 0;
        this.Area = function () {
            return _this.width * _this.height;
        };
        this.draw = function () {
            ctx.save();
            ctx.translate(_this.offsetX(), _this.offsetY());
            ctx.drawImage(_this.image, 0, 0);
            ctx.restore();
        };
        this.name = image.id;
        this._buffer = document.createElement('canvas');
        this.x = 0;
        this.y = 0;
        this.width = image.naturalWidth;
        this.height = image.naturalHeight;
        this._buffer.width = this.width;
        this._buffer.height = this.height;
        this._btx = this._buffer.getContext('2d');
        this.image = image;
        this._btx.drawImage(this.image, 0, 0);
        var pixels = this._btx.getImageData(0, 0, this.width, this.height).data;
        for (var c = 0; c < this.image.naturalWidth; c++) {
            for (var r = 0; r < this.image.naturalHeight; r++) {
                var alpha_pos = ((r * this.image.naturalWidth) + c) * 4 + 3;
                if (pixels[alpha_pos] != 0) {
                    this.trimLeft = c - 1;
                    c = this.image.naturalWidth;
                    break;
                }
            }
        }
        for (c = this.image.naturalWidth - 1; c >= 0; c--) {
            for (r = 0; r < this.image.naturalHeight; r++) {
                var alpha_pos = ((r * this.image.naturalWidth) + c) * 4 + 3;
                if (pixels[alpha_pos] != 0) {
                    this.trimRight = c + 1;
                    c = -1;
                    break;
                }
            }
        }
        for (r = 0; r < this.image.naturalHeight; r++) {
            for (c = 0; c < this.image.naturalWidth; c++) {
                var alpha_pos = ((r * this.image.naturalWidth) + c) * 4 + 3;
                if (pixels[alpha_pos] != 0) {
                    this.trimTop = r - 1;
                    r = this.image.naturalHeight;
                    break;
                }
            }
        }
        for (r = this.image.naturalHeight - 1; r >= 0; r--) {
            for (c = 0; c < this.image.naturalWidth; c++) {
                var alpha_pos = ((r * this.image.naturalWidth) + c) * 4 + 3;
                if (pixels[alpha_pos] != 0) {
                    this.trimBottom = r + 1;
                    r = -1;
                    break;
                }
            }
        }
        this.trimRight += SpritePacker.PADDING;
        this.trimLeft -= SpritePacker.PADDING;
        this.trimBottom += SpritePacker.PADDING;
        this.trimTop -= SpritePacker.PADDING;
        this.trimmedWidth = this.trimRight - this.trimLeft;
        this.trimmedHeight = this.trimBottom - this.trimTop;
    }
    return Sprite;
})();
/*
*  I HAVE TWO CLASSES IN THIS FILE.  THE MAIN ONE IS THE FRAME.  A TEXTURE ATLAS
*  IS A COLLECTION OF FRAMES INSIDE A PNG FILE AND JSON FILE.  THESE FRAMES WILL
*  BE WRITTEN AS TEXT IN THE JSON FILE.
*
*  YOU CAN FIND TYPESCRIPT CODE THAT LOADS A TEXTURE ATLAS ON
*  MY WEBSITE:
*  http://www.typescriptgames.com
*
*  IF YOU HAVE ANY QUESTIONS, PLEASE TWEET ME @typescriptgames
*/
var Frame = (function () {
    function Frame(frame, spriteSourceSize, sourceW, sourceH) {
        this.rotated = false;
        this.trimmed = true;
        this.sourceSize = {};
        this.frame = frame;
        this.spriteSourceSize = spriteSourceSize;
        this.sourceSize.w = sourceW;
        this.sourceSize.h = sourceH;
    }
    return Frame;
})();
/*
 * THE RECTANGLE CLASS HAS AN X, Y, WIDTH AND HEIGHT VARIABLE, AND WILL
 * BE WRITTEN INTO THE JSON FILE WHEN THE TEXTURE ATLAS IS GENERATED
 */
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rectangle;
})();
/*
 * THIS WORKS WITH VISUAL STUDIO COMMUNITY IF YOU HAVE
 * THE PROJECT GENERATE A SINGLE .js FILE
 */
///<reference path="./SpritePacker.ts"/>
///<reference path="./Sprite.ts"/>
///<reference path="./Frame.ts"/>
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
var ctx;
var renderPNG = false;
var readyToRender = false;
var renderCallback;
function renderSetup(callback) {
    renderPNG = true;
    readyToRender = true;
    renderCallback = callback;
}
function gameLoop() {
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
window.onload = function () {
    var sprite_packer = new SpritePacker(document.getElementById("atlascanvas"));
    ctx = SpritePacker.SINGLETON.canvas.getContext("2d");
    gameLoop();
};
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
//# sourceMappingURL=app.js.map