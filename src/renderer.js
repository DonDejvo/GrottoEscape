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
}