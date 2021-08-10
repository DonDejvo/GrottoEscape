import { entity } from "./entity.js";
import { Layer } from "./layer.js";
import { Level } from "./level.js";
import { Loader } from "./loader.js";
import { Renderer } from "./renderer.js";
import { Scene } from "./scene.js";
import { textbox } from "./textbox.js";
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
        this._menuScene = new Scene({
            resources: this._resources
        });
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
                    tileWidth: 16 * 3,
                    tileHeight: 16 * 3,
                    textboxHandler: this._textboxHandler,
                    resources: this._resources
                });
                this._levelScene._camera.SetPosition(new Vector(350, 200));
                this._levelScene.Play();
                this._scene = this._levelScene;
                this._PlayMusic(this._resources["levelTheme"]);
                this._levelScene._camera.SetScale(2);
                setTimeout(() => {
                    this._levelScene.AddMessage("res/assets/png/player.png", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Suspendisse nisl. Nullam eget nisl. Integer in sapien. Nam quis nulla. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est.");
                    this._levelScene.AddMessage("res/assets/png/player.png", "Fusce consectetuer risus a nunc. Suspendisse nisl. Curabitur bibendum justo non orci. Aenean fermentum risus id tortor. Quisque tincidunt scelerisque libero. Nam sed tellus id magna elementum tincidunt.");
                    this._levelScene._camera.ScaleTo(1, 1200, "ease-out");
                }, 0);
                const player = this._levelScene.Get("player");
                player.GetComponent("drawobj").PlayAnim("jump", 200, true);
                this._levelScene._camera.Follow(player);
            }, 3000);
        });
    }
    _OpenMenu() {
        this._PlayMusic(this._resources["menuTheme"]);
        this._scene = this._menuScene;
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
            .AddJSON("tileset", "tilesets/grotto_tileset.json")
            .AddJSON("level01", "levels/level01.json")
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
        this._renderer.SetBgColor("#021721");
        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
        this._textboxHandler = new textbox.TextboxHandler({
            domElement: document.querySelector(".textbox-container")
        });
        this._renderer._container.addEventListener(this._eventByDevice, () => {
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