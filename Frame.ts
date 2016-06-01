class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Frame {
    frame: Rectangle;
    rotated: boolean = false;
    trimmed: boolean = true;
    spriteSourceSize: Rectangle;
    sourceSize: any = {};

    constructor(frame: Rectangle, spriteSourceSize: Rectangle, sourceW: number, sourceH: number) {
        this.frame = frame;
        this.spriteSourceSize = spriteSourceSize;
        this.sourceSize.w = sourceW;
        this.sourceSize.h = sourceH;
    }
}