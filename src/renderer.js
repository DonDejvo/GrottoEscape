export class Renderer {
    constructor(width, height, container, canvas) {
        this._width = width;
        this._height = height;
        this._container = container;
        this._canvas = canvas;
        this._bgColor = "black";
        this._Init();
    }
    _Init() {
        this._aspect = this._width / this._height;
        this._scale = 1.0;
        this._canvas.width = this._width;
        this._container.style.width = this._width + "px";
        this._canvas.height = this._height;
        this._container.style.height = this._height + "px";
        this._context = this._canvas.getContext("2d");
        this._OnResize();
        window.addEventListener("resize", () => {
            this._OnResize();
        });
    }
    _OnResize() {
        const [width, height] = [document.body.clientWidth, document.body.clientHeight];
        if(width / height > this._aspect) {
            this._scale = height / this._height;
        } else {
            this._scale = width / this._width;
        }
        this._container.style.transform = `translate(-50%, -50%) scale(${this._scale})`;
        this._context.imageSmoothingEnabled = false;
    }
    SetBgColor(c) {
        this._bgColor = c;
    }
    Render(scene) {
        if(!scene) {
            return;
        }
        this._context.beginPath();
        this._context.fillStyle = this._bgColor;
        this._context.fillRect(0, 0, this._width, this._height);
        this._context.save();
        this._context.translate(-scene._camera._pos.x * scene._camera._scale + this._width / 2, -scene._camera._pos.y * scene._camera._scale + this._height / 2);
        this._context.scale(scene._camera._scale, scene._camera._scale);
        for(let elem of scene._drawable) {
            const pos = elem._pos.Clone();
            pos.Sub(scene._camera._pos);
            pos.Mult(scene._camera._scale);
            const [width, height] = [elem._width, elem._height].map((_) => _ * scene._camera._scale);
            if(
                pos.x + width / 2 < -this._width * 0.5 ||
                pos.x - width / 2 > this._width * 0.5 ||
                pos.y + height / 2 < -this._height * 0.5 ||
                pos.y - height / 2 > this._height * 0.5
            ) {
                continue;
            }
            elem.Draw(this._context);
        }
        this._context.restore();
    }
}