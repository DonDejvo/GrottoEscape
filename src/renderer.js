export class Renderer {
    constructor(width, height, container, canvas) {
        this._width = width;
        this._height = height;
        this._container = container;
        this._canvas = canvas;
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
    }
    Render(scene) {
        this._context.beginPath();
        this._context.clearRect(0, 0, this._width, this._height);
        this._context.save();
        this._context.translate(-scene._camera._pos.x + this._width / 2, -scene._camera._pos.y + this._height / 2);
        this._context.scale(scene._camera._scale, scene._camera._scale);
        for(let elem of scene._drawable) {
            const pos = elem._pos.Clone();
            pos.Sub(scene._camera._pos);
            pos.Mult(scene._camera._scale);
            const [width, height] = [elem._width, elem._height].map((e) => e * scene._camera._scale);
            if(
                pos.x + width / 2 < -this._width / 2 ||
                pos.x - width / 2 > this._width / 2 ||
                pos.y + height / 2 < -this._height / 2 ||
                pos.y - height / 2 > this._height / 2
            ) {
                continue;
            }
            elem.Draw(this._context);
        }
        this._context.restore();
    }
}