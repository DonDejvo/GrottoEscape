import { drawable } from "./drawable.js";
import { entity } from "./entity.js";
import { input } from "./input.js";
import { Level } from "./level.js";
import { levelData } from "./levelData.js";
import { Loader } from "./loader.js";
import { Renderer } from "./renderer.js";
import { SceneManager } from "./scene-manager.js";
import { Scene } from "./scene.js";
import { textbox } from "./textbox.js";
import { tileset } from "./tileset.js";
import { Vector } from "./vector.js";
import { ExitHandler } from "./exit-handler.js";
import { math } from "./math.js";
import { player_entity } from "./player-entity.js";

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
    _PauseMusic() {
        this._music.pause();
    }
    _StartGame() {
        this._gameState = {
            level: 0,
            lives: 5,
            bullets: 3,
            max_hitpoints: 100,
            hitpoints: 100,
            crystals: 0
        };
    }
    _InitLevel(id) {
        const level = this._levels.find(level => level.id == id);
        if(!level) {
            return;
        }
        this._resources[level.bgmusic].loop = true;
        
        const levelScene = new Level({
            data: level,
            tileset: this._tileset,
            textboxHandler: this._textboxHandler,
            resources: this._resources,
            input: this._input
        });
        const player = levelScene.Get("player");
        player.AddComponent(new player_entity.Controller({
            states: this._gameState,
            dom: {
                lives: document.getElementById("lives-count"),
                hpbar: document.getElementById("hpbar-image"),
                crystals: document.getElementById("crystals-count"),
            }
        }));
        levelScene._camera.SetPosition(player._pos);
        levelScene._camera.Follow(player);
        this._sceneManager.AddScene("level" + id, levelScene);
        const exit = levelScene.Get("exit");
        exit.AddComponent(new ExitHandler(() => {
            if(level.next == -1) {
                document.querySelector(".mainMenu").style.display = "block";
                this._OpenMenu();
            } else {
                this._InitLevel(level.next);
                this._OpenLevel(level.next);
            }
        }));
    }
    _OpenLevel(id) {
        const level = this._levels.find(level => level.id == id);
        if(!level) {
            return;
        }
        this._PauseMusic();
        document.querySelector(".loadingScreen").style.display = "block";
        document.querySelector(".levelLoadingHint").textContent = "Hint: " + this._hints[math.randint(0, this._hints.length - 1)];
        setTimeout(() => {
            document.querySelector(".loadingScreen").style.display = "none";
            this._PlayMusic(this._resources[level.bgmusic]);
            this._sceneManager.PlayScene("level" + id);
        }, 3000);
    }
    _InitMenu() {

        this._resources["menuTheme"].loop = true;

        const menuScene = new Scene({
            resources: this._resources
        });
        const layer = new entity.Entity();
        layer.AddComponent(new drawable.Layer({
            width: 1504 * 2,
            height: 256 * 2,
            gameWidth: this._renderer._width,
            gameSpeed: 36,
            speedModifier: 1.0,
            image: this._resources["preview"]
        }));
        layer.SetPosition(new Vector(0, -256));
        menuScene.Add(layer);
        this._sceneManager.AddScene("menu", menuScene);

        document.getElementById("playBtn").addEventListener(this._eventByDevice, () => {
            document.querySelector(".mainMenu").style.display = "none";
            this._StartGame();
            this._InitLevel(0);
            this._OpenLevel(0);
        });
    }
    _OpenMenu() {
        document.querySelector("#game-controls").style.visibility = "hidden";
        this._PlayMusic(this._resources["menuTheme"]);
        this._sceneManager.PlayScene("menu");
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
            .AddImage("tileset-image", "assets/spritesheets/environment-tiles.png")
            .AddImage("items", "assets/spritesheets/items.png")
            .AddImage("bat", "assets/spritesheets/bat.png")
            .AddImage("ghost", "assets/spritesheets/ghost.png")
            .AddImage("player", "assets/spritesheets/player.png")
            .AddImage("skeleton", "assets/spritesheets/skeleton.png")
            .AddImage("enemies", "assets/spritesheets/enemies.png")
            .AddImage("lavaball", "assets/spritesheets/fire-ball.png")
            .AddImage("preview", "assets/png/environment-PREVIEW.png")
            .AddAudio("jump-sound", "audio/sounds/jump.wav")
            .AddAudio("laser-sound", "audio/sounds/laser.wav")
            .AddAudio("pickup-sound", "audio/sounds/pickup.wav")
            .AddAudio("menuTheme", "audio/bg-music/menuTheme.mp3")
            .AddAudio("levelTheme", "audio/bg-music/levelTheme.mp3")
            .AddJSON("tileset", "tilesets/grotto_tileset.json")
            .AddJSON("level01", "levels/level00.json")
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

        this._levels = levelData;
        this._hints = [
            "You can buy more lives in shop",
            "Use ledder as safe place",
            "Some levels have secret rooms",
            "Pay attention what merchant tells you"
        ];

        document.querySelector(".loadingScreen").style.display = "none";

        this._renderer = new Renderer(480, 720, document.querySelector(".gameContainer"), document.getElementById("game"));
        this._renderer.SetBgColor("rgb(2,17,27)");

        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";

        this._textboxHandler = new textbox.TextboxHandler({
            domElement: document.querySelector(".textbox-container")
        });

        this._sceneManager = new SceneManager();

        this._input = {
            keyboard: new input.Keyboard(),
            joystick: new input.Joystick(document.getElementById("joystick")),
            jumpButton: new input.Button(document.getElementById("jump-btn")),
            shootButton: new input.Button(document.getElementById("shoot-btn")),
        };

        this._renderer._container.addEventListener(this._eventByDevice, () => {
            if(this._sceneManager.currentScene) {
                this._sceneManager.currentScene.OnClick();
            }
        });
        this._input.keyboard.AddListener("Space", "keypress", () => {
            if(this._sceneManager.currentScene) {
                this._sceneManager.currentScene.OnClick();
            }
        })

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
            this._renderer.Render(this._sceneManager.currentScene);
            this._previousRAF = timestep;
        });
    }
    _Step(elapsedTime) {
        const elapsedTimeS = Math.min(1 / 30, elapsedTime * 0.001);
        this._sceneManager.Update(elapsedTimeS);
    }
}

window.addEventListener("DOMContentLoaded", () => new Game());