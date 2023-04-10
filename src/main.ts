import "./style.css";
import { Application, Assets, Rectangle, Texture } from "pixi.js";
import { generateTiles } from "./MapGenerator";
import { displayTestTiles } from "./tests";
const tileWidth = 50;
const mapWidth = 9;

const appElement = document.querySelector<HTMLDivElement>("#app")!;
const app = new Application({
    width: 500,
    height: 500,
    backgroundColor: "909090",
});

const wallTexture = await getWallTexture();
const tiles = generateTiles(wallTexture, tileWidth);
displayTestTiles(tiles, app, mapWidth, tileWidth);

appElement?.appendChild(app.view as HTMLCanvasElement);

/**
 * anything bellow is for testing
 */
async function getWallTexture() {
    Assets.backgroundLoad("cave_tileset.png");
    const wallTexture = await Assets.load<Texture>("cave_tileset.png");
    const frame = new Rectangle(168, 160, tileWidth / 2, tileWidth);
    wallTexture.frame = frame;
    wallTexture.updateUvs();
    return wallTexture;
}
