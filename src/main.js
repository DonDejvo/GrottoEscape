import { entity } from "./entity.js";
import { Layer } from "./layer.js";
import { Level } from "./level.js";
import { Loader } from "./loader.js";
import { Renderer } from "./renderer.js";
import { Scene } from "./scene.js";
import { tileset } from "./tileset.js";
import { Vector } from "./vector.js";


class Game {
    constructor() {
        this._Init();
    }
    _PlayMusic(music) {
        if(this._music && !this._music.paused) {
            this._music.pause();
        }
        this._music = music;
        this._music.loop = true;
        this._music.play();
    }
    _InitMenu() {
        this._resources["menuTheme"].loop = true;
        this._menuScene = new Scene();
        const layer = new entity.Entity();
        layer.AddComponent(new Layer({
            width: 1504 * 2,
            height: 256 * 2,
            gameWidth: this._renderer._width,
            gameSpeed: 36,
            speedModifier: 1.0,
            image: this._resources["preview"]
        }), "drawobj");
        layer.SetPosition(new Vector(0, -256));
        this._menuScene.Add(layer);
        this._menuScene.Play();

        document.getElementById("playBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            document.querySelector(".loadingScreen").style.display = "block";
            setTimeout(() => {
                document.querySelector(".loadingScreen").style.display = "none";
                this._levelScene = new Level({
                    tilemap: this._resources["level01"], 
                    tileset: this._tileset,
                    tileWidth: 32,
                    tileHeight: 32
                });
                this._levelScene._camera.SetPosition(new Vector(400, 200));
                this._levelScene.Play();
                this._scene = this._levelScene;
                this._PlayMusic(this._resources["levelTheme"]);
                setTimeout(() => {
                    this._levelScene.Pause();
                    document.querySelector(".textbox-container").style.display = "block";
                    window.addEventListener(this._eventByDevice, () => {
                        document.querySelector(".textbox-container").style.display = "none";
                        this._levelScene.Play();
                    }, {once: true});
                }, 250);
            }, 3000);
        });
    }
    _OpenMenu() {
        this._PlayMusic(this._resources["menuTheme"]);
        this._scene = this._menuScene;
        document.querySelector(".textbox-container").style.display = "none";
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
            .AddAudio("levelTheme", "audio/bg-music/levelTheme.mp3")
            .AddJSON("tileset", "layouts/grottoEnvironment.json")
            .AddJSON("level01", "layouts/level01.json")
            .Load((data) => {
                this._resources = data;

                this._tileset = new tileset.Tileset(this._resources["tileset"], this._resources["tileset-image"]);

                this._InitMenu();

                document.querySelector(".loadingText").textContent = "Done";
                document.querySelector(".loadingIntro").style.opacity = 0.25;
                
                this._OpenMenu();

                this._RAF();
                setTimeout(() => {
                    document.querySelector(".loadingIntro").style.display = "none";
                }, 1000);
            });
    }
    _Init() {

        document.querySelector(".loadingScreen").style.display = "none";

        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        window.addEventListener(this._eventByDevice, () => {
            document.querySelector(".loadingText").textContent = "Loading...";
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