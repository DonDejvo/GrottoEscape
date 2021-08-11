import { entity } from "./entity.js";
import { Vector } from "./vector.js";

export const physics = (() => {

    class Body extends entity.Component {
        constructor(params) {
            super();
            this._params = params;
            this._vel = new Vector(0, 0);
            this._friction = {
                x: (this._params.frictionX || 0),
                y: (this._params.frictionY || 0)
            };
            this._collide = {left: null, right: null, top: null, bottom: null};
            this._oldCollide = {left: null, right: null, top: null, bottom: null};
        }
        InitComponent() {
            this._pos = this._parent._pos;
            this._oldPos = this._pos.Clone();
        }
        Update(elapsedTimeS) {
            
        }
    }

    class Box extends Body {
        constructor(params) {
            super(params);
            this._width = params.width;
            this._height = params.height;
        }
    }

    class Line extends Body {
        constructor(params) {
            super(params);
            this._start = new Vector(this._params.start.x, this._params.start.y);
            this._end = new Vector(this._params.end.x, this._params.end.y);
            this._width = Math.abs(this._start.x - this._end.x);
            this._height = Math.abs(this._start.y - this._end.y);
        }
    }

    const GRAVITY = 400;

    const ResolveCollision = (mover, platform) => {
        switch(platform.constructor.name) {
            case "Box":
                ResolveCollisionBox(mover, platform);
                break;
            case "Line":
                ResolveCollisionLine(mover, platform);
                break;
        }
    };

    const ResolveCollisionBox = (mover, platform) => {

        const Collide = (a1, a2, d1, d2) => {
            return Math.abs(a1 - a2) < (d1 + d2) / 2;
        }

        let x1, x2, y1, y2;
        x1 = x2 = mover._pos.x;
        y1 = y2 = mover._pos.y;

        if(
            Collide(mover._pos.x, platform._pos.x, mover._width, platform._width) && 
            Collide(mover._oldPos.y, platform._pos.y, mover._height, platform._height)
        ) {
            if(mover._vel.x > 0) {
                x1 = platform._pos.x - (mover._width + platform._width) / 2;
            } else if(mover._vel.x < 0) {
                x1 = platform._pos.x + (mover._width + platform._width) / 2;
            }
        }

        if(
            Collide(mover._oldPos.x, platform._pos.x, mover._width, platform._width) && 
            Collide(mover._pos.y, platform._pos.y, mover._height, platform._height)
        ) {
            if(mover._vel.y > 0) {
                y1 = platform._pos.y - (mover._height + platform._height) / 2;
            } else if(mover._vel.y < 0) {
                y1 = platform._pos.y + (mover._height + platform._height) / 2;
            }
        }

        if(
            Collide(mover._pos.x, platform._pos.x, mover._width, platform._width) && 
            Collide(mover._pos.y, platform._pos.y, mover._height, platform._height)
        ) {
            if(mover._vel.x > 0) {
                x2 = platform._pos.x - (mover._width + platform._width) / 2;
            } else if(mover._vel.x < 0) {
                x2 = platform._pos.x + (mover._width + platform._width) / 2;
            }
            if(mover._vel.y > 0) {
                y2 = platform._pos.y - (mover._height + platform._height) / 2;
            } else if(mover._vel.y < 0) {
                y2 = platform._pos.y + (mover._height + platform._height) / 2;
            }
        }

        if(x1 == x2 && x1 != mover._pos.x) {
            mover._pos.x = x1;
            if(mover._vel.x > 0) {
                mover._collide.right = platform;
            } else {
                mover._collide.left = platform;
            }
        } else if(y1 == y2 && y1 != mover._pos.y) {
            mover._pos.y = y1;
            if(mover._vel.y > 0) {
                mover._collide.bottom = platform;
            } else {
                mover._collide.top = platform;
            }
        }
    };

    const ResolveCollisionLine = (mover, platform) => {
        // Stuff here
    };

    const DetectCollision = (body1, body2) => {
        // Stuff here
    };

    return {
        Box: Box,
        Line: Line,
        GRAVITY: GRAVITY,
        ResolveCollision: ResolveCollision,
        DetectCollision: DetectCollision
    }

})();