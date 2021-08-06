import { Layer } from "./layer.js";
import { Loader } from "./loader.js";
import { Renderer } from "./renderer.js";
import { Scene } from "./scene.js";
import { Vector } from "./vector.js";


class Game {
    constructor() {
        this._Init();
    }
    _Preload() {
        const loader = new Loader();
        loader
            .OnProgress((progress, obj) => {
                const percents = parseInt(progress * 100);
                document.querySelector(".progressBar_progress").style.width = percents + "%";
                document.getElementById("loadingProgress").textContent = percents + "%";
                console.log(`${percents}% ... ${obj.path}`);
            })
            //.SetPath("https://raw.githubusercontent.com/DonDejvo/GrottoEscape/main/res")
            .SetPath("res")
            .AddImage("tileset-image", "assets/png/environment-tiles.png")
            .AddImage("items", "assets/png/items.png")
            .AddImage("hp-bar", "assets/png/meter.png")
            .AddImage("bat", "assets/spritesheets/bat.png")
            .AddImage("ghost", "assets/spritesheets/ghost.png")
            .AddImage("player", "assets/spritesheets/player.png")
            .AddImage("skeleton", "assets/spritesheets/skeleton.png")
            .AddImage("enemies", "assets/spritesheets/enemies.png")
            .AddImage("preview", "assets/png/environment-PREVIEW.png")
            .AddAudio("jump-sound", "audio/sounds/jump.wav")
            .AddAudio("laser-sound", "audio/sounds/laser.wav")
            .AddAudio("pickup-sound", "audio/sounds/pickup.wav")
            .AddAudio("menuTheme", "audio/bg-music/menuTheme.mp3")
            .AddJSON("tileset", "layouts/grottoEnvironment.json")
            .Load((data) => {
                this._resources = data;
                this._resources["menuTheme"].loop = true;
                this._resources["menuTheme"].play();
                document.querySelector(".loadingText").textContent = "Done";
                document.querySelector(".loadingIntro").style.opacity = 0;
                this._menuScene = new Scene();
                const layer = new Layer({
                    width: 1504 * 2,
                    height: 256 * 2,
                    gameWidth: this._renderer._width,
                    gameSpeed: 36,
                    speedModifier: 1.0,
                    image: this._resources["preview"]
                });
                layer.SetPosition(new Vector(0, -256));
                this._menuScene.Add(layer);
                this._scene = this._menuScene;
                this._RAF();
                setTimeout(() => {
                    document.querySelector(".loadingIntro").style.display = "none";
                }, 1000);
            });
    }
    _Init() {
        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        window.addEventListener(this._eventByDevice, () => {
            this._Preload();
        }, {once: true});
    }
    _RAF() {
        window.requestAnimationFrame((timestep) => {
            if(!this._previousRAF) {
                this._previousRAF = timestep;
            }
            this._RAF();
            this._Step(timestep - this._previousRAF);
            this._renderer.Render(this._scene);
            this._previousRAF = timestep;
        });
    }
    _Step(elapsedTime) {
        const elapsedTimeS = Math.min(1 / 30, elapsedTime * 0.001);
        this._scene.Update(elapsedTimeS);
    }
}

let app = null;

window.addEventListener("DOMContentLoaded", () => {
    app = new Game();
});