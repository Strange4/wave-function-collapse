import { Application } from "pixi.js";
import { MazeTile } from "./MapGenerator";

export function displayTestTiles(
    tiles: MazeTile[],
    app: Application,
    mapWidth: number,
    tileWidth: number
) {
    mapWidth -= 1;
    tiles.forEach((tile, index) => {
        const container = tile.generateSprites();
        container.x = (index % mapWidth) * (tileWidth + 4);
        container.y = Math.floor(index / mapWidth) * (tileWidth + 4);
        app.stage.addChild(container);
    });
}
