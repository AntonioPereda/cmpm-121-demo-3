import leaflet from "leaflet";
import luck from "./luck.ts";

interface Cell {
    readonly i: number; // Logical X-coordinate
    readonly j: number; // Logical Y-coordinate
    isOccupied: boolean; // Whether the cell contains a game object
}

export class Board {

    readonly tileWidth: number;
    readonly tileVisibilityRadius: number;

    private readonly knownCells: Map<string, Cell>;

    constructor(tileWidth: number, tileVisibilityRadius: number) {
        // ...
        this.tileWidth = tileWidth;
        this.tileVisibilityRadius = tileVisibilityRadius;
        this.knownCells = new Map();

    }

    private getCanonicalCell(cell: Cell): Cell {
        const { i, j } = cell;
        const key = [i, j].toString();
        // GET SINGLE CELL
        if (!(key in this.knownCells)){
            this.knownCells[key] = cell;
        }        
        //console.log(this.knownCells[key]);
        return this.knownCells[key]!;
    }



    /*
    point = [36.98949379578401, -122.06277128548504]
    
    */
    getCellForPoint(point: leaflet.LatLng): Cell {
        // Determine the row and column indices for this point
        const i = point.lat; // Row index
        const j = point.lng; // Column index
        
        // Use `${i},${j}` as the unique key for this tile
        const key = `${i},${j}`;
        if (!this.knownCells.has(key)) {
            //console.log(`Creating new tile at (${i}, ${j})`);
            this.knownCells.set(key, { i, j, isOccupied: false });
        } else {
            //console.log(`Tile (${i}, ${j}) already exists.`);
        }
    
        // Return the tile object
        return this.knownCells.get(key)!;
    }

            

    getCellBounds(cell: Cell): leaflet.LatLngBounds {
        const { i, j } = cell;
    
        // Convert grid coordinates into real-world Lat/Lng using the tileWidth
        const southWest = leaflet.latLng(i * this.tileWidth, j * this.tileWidth); // Bottom-left corner
        const northEast = leaflet.latLng((i + 1) * this.tileWidth, (j + 1) * this.tileWidth); // Top-right corner
    
        // Create and return the bounds
        return leaflet.latLngBounds(southWest, northEast);
    }

    getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
    
        // Iterate over visible area
        for (let iOffset = -this.tileVisibilityRadius; iOffset <= this.tileVisibilityRadius; iOffset++) {
            for (let jOffset = -this.tileVisibilityRadius; jOffset <= this.tileVisibilityRadius; jOffset++) {
                const neighborRow = originCell.i + iOffset;
                const neighborColumn = originCell.j + jOffset;
    
                // Make sure it's within bounds of existing tiles
                if (neighborRow >= 0 && neighborColumn >= 0) {
                    const neighborCell = this.getCanonicalCell({
                        i: neighborRow,
                        j: neighborColumn,
                        isOccupied: false
                    });
                    resultCells.push(neighborCell);
                }
            }
        }
    
        return resultCells;
    }
}