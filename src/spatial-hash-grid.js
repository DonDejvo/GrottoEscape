import { entity } from "./entity.js";
import { math } from "./math.js";

export const spatial_hash_grid = (() => {

    class SpatialHashGrid {
      constructor(bounds, dimensions) {
        const [x, y] = dimensions;
        this._cells = [...Array(y)].map(_ => [...Array(x)].map(_ => (null)));
        this._dimensions = dimensions;
        this._bounds = bounds;
      }
    
      NewClient(position, dimensions) {
        const client = {
          position: position,
          dimensions: dimensions,
          indices: null
        };
        this._InsertClient(client);
        return client;
      }

      _InsertClient(client) {
        const [w, h] = client.dimensions;
        const [x, y] = client.position;

        const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

        client.indices = [i1, i2];

        for(let y = i1[1]; y <= i2[1]; ++y) {
          for(let x = i1[0]; x <= i2[0]; ++x) {

            if(!this._cells[y][x]) {
              this._cells[y][x] = new Set();
            }

            this._cells[y][x].add(client);
          }
        }
      }

      _GetCellIndex(position) {
        const x = math.sat((position[0] - this._bounds[0][0]) / (this._bounds[1][0] - this._bounds[0][0]));
        const y = math.sat((position[1] - this._bounds[0][1]) / (this._bounds[1][1] - this._bounds[0][1]));
        const xIndex = Math.floor(x * (this._dimensions[0] - 1));
        const yIndex = Math.floor(y * (this._dimensions[1] - 1));

        return [xIndex, yIndex];
      }

      FindNear(position, bounds) {
        const [w, h] = bounds;
        const [x, y] = position;

        const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

        const clients = new Set();

        for(let y = i1[1]; y <= i2[1]; ++y) {
          for(let x = i1[0]; x <= i2[0]; ++x) {

            if(this._cells[y][x]) {
              for(let v of this._cells[y][x]) {
                clients.add(v);
              }
            }
          }
        }
        return Array.from(clients);
      }

      UpdateClient(client) {
        this.RemoveClient(client);
        this._InsertClient(client);
      }

      RemoveClient(client) {
        const [i1, i2] = client.indices;

        for(let y = i1[1]; y <= i2[1]; ++y) {
          for(let x = i1[0]; x <= i2[0]; ++x) {
            this._cells[y][x].delete(client);
          }
        }
      }

    }
    
    class SpatialGridController extends entity.Component {
      constructor(params) {
        super();
        this._params = params;
        this._grid = this._params.grid;

      }
      InitComponent() {
        const pos = [
          this._parent._pos.x,
          this._parent._pos.y
        ];
        this._client = this._grid.NewClient(pos, [this._params.width, this._params.height]);
        this._client.entity = this._parent;
      }
      Update(elapsedTimeS) {
        const pos = [
          this._parent._pos.x,
          this._parent._pos.y
        ];
        if(pos[0] == this._client.position[0] && pos[1] == this._client.position[1]) {
          return;
        }
        this._client.position = pos;
        this._grid.UpdateClient(this._client);
      }
      FindNearby(rangeX, rangeY) {
        const results = this._grid.FindNear(
          [this._parent._pos.x, this._parent._pos.y], [rangeX, rangeY]
        );
        return results.filter(c => c.entity != this._parent);
      }
      Remove() {
        this._grid.RemoveClient(this._client);
      }
    }

    return {
      SpatialHashGrid: SpatialHashGrid,
      SpatialGridController: SpatialGridController
    };
  
  })();