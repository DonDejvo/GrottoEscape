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
                document.querySelector(".progressBar_progress").style.width = percents + "%";
                document.getElementById("loadingProgress").textContent = percents + "%";
                console.log(`${percents}% ... ${obj.path}`);
            })
            .SetPath("https://raw.githubusercontent.com/DonDejvo/GrottoEscape/main")
            .AddImage("tileset-image", "res/assets/png/environment-tiles.png")
            .AddImage("items", "res/assets/png/items.png")
            .AddImage("hp-bar", "res/assets/png/meter.png")
            .AddImage("bat", "res/assets/spritesheets/bat.png")
            .AddImage("ghost", "res/assets/spritesheets/ghost.png")
            .AddImage("player", "res/assets/spritesheets/player.png")
            .AddImage("skeleton", "res/assets/spritesheets/skeleton.png")
            .AddImage("enemies", "res/assets/spritesheets/enemies.png")
            .AddAudio("jump-sound", "res/audio/sounds/jump.wav")
            .AddAudio("laser-sound", "res/audio/sounds/laser.wav")
            .AddAudio("pickup-sound", "res/audio/sounds/pickup.wav")
            .AddJSON("tileset", "res/layouts/grottoEnvironment.json")
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