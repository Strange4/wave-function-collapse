import "./style.css";
import { Application, Sprite, Assets, Rectangle, Texture } from "pixi.js";
import { generateTiles } from "./MapGenerator";
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
tiles.forEach((tile, index) => {
    const container = tile.generateSprites();

    container.x = (index % mapWidth) * (tileWidth + 4);
    container.y = Math.floor(index / mapWidth) * (tileWidth + 4);
    app.stage.addChild(container);
});
appElement?.appendChild(app.view as HTMLCanvasElement);

async function getWallTexture() {
    Assets.backgroundLoad("cave_tileset.png");
    const wallTexture = await Assets.load<Texture>("cave_tileset.png");
    const frame = new Rectangle(168, 160, tileWidth / 2, tileWidth);
    wallTexture.frame = frame;
    wallTexture.updateUvs();
    return wallTexture;
}
