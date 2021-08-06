import { Loader } from "./loader.js";
import { Renderer } from "./renderer.js";


class Game {
    constructor() {
        this._Init();
    }
    _Preload() {
        const loader = new Loader();
        loader
            .OnProgress((progress, obj) => {
                const percents = parseInt(progress * 100);
                document.querySelector(".progressBar_progress").getElementsByClassName.width = percents + "%";
                document.getElementById("loadingProgress").textContent = percents + "%";
                console.log(`${percents}% ... ${obj.path}`);
            })
            .SetPath("res/assets/png")
            .AddImage("tileset-image", "environment-tiles.png")
            .AddImage("items", "items.png")
            .AddImage("hp-bar", "meter.png")
            .SetPath("res/assets/spritesheets")
            .AddImage("bat", "bat.png")
            .AddImage("ghost", "ghost.png")
            .AddImage("player", "player.png")
            .AddImage("skeleton", "skeleton.png")
            .AddImage("enemies", "enemies.png")
            .SetPath("res/audio/sounds")
            .AddAudio("jump-sound", "jump.wav")
            .AddAudio("laser-sound", "laser.wav")
            .AddAudio("pickup-sound", "pickup.wav")
            .SetPath("res/layouts")
            .AddJSON("tileset", "grottoEnvironment.json")
            .Load((data) => {

            });
    }
    _Init() {
        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._Preload();
    }
}

let app = null;

window.addEventListener("DOMContentLoaded", () => {
    app = new Game();
});