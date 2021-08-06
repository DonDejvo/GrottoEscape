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
            .SetPath("https://raw.githubusercontent.com/DonDejvo/GrottoEscape/main/res")
            .AddImage("tileset-image", "assets/png/environment-tiles.png")
            .AddImage("items", "assets/png/items.png")
            .AddImage("hp-bar", "assets/png/meter.png")
            .AddImage("bat", "assets/spritesheets/bat.png")
            .AddImage("ghost", "assets/spritesheets/ghost.png")
            .AddImage("player", "assets/spritesheets/player.png")
            .AddImage("skeleton", "assets/spritesheets/skeleton.png")
            .AddImage("enemies", "assets/spritesheets/enemies.png")
            .AddAudio("jump-sound", "audio/sounds/jump.wav")
            .AddAudio("laser-sound", "audio/sounds/laser.wav")
            .AddAudio("pickup-sound", "audio/sounds/pickup.wav")
            .AddJSON("tileset", "layouts/grottoEnvironment.json")
            .Load((data) => {
                this._resources = data;
                this._resources["pickup-sound"].play();
                document.querySelector(".loadingText").textContent = "Done";
                document.querySelector(".loadingIntro").style.opacity = 0;
                setTimeout(() => {
                    document.querySelector(".loadingIntro").style.display = "none";
                }, 1000);
            });
    }
    _Init() {
        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        const eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        window.addEventListener(eventByDevice, () => {
            this._Preload();
        }, {once: true});
    }
}

let app = null;

window.addEventListener("DOMContentLoaded", () => {
    app = new Game();
});