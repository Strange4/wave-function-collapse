import "./style.css";
import { Application, Sprite, Assets, Rectangle, Texture } from "pixi.js";
import { algo } from "./MapGenerator";

const appElement = document.querySelector<HTMLDivElement>("#app")!;
const app = new Application({
    resizeTo: appElement,
});

Assets.backgroundLoad("cave_tileset.png");
const texture = await Assets.load<Texture>("cave_tileset.png");
const torchRectangle = new Rectangle(224, 128, 32, 32);
texture.frame = torchRectangle;
const torch = new Sprite(texture);

torch.x = app.renderer.width / 2;
torch.y = app.renderer.height / 2;
torch.anchor.set(0.5);
app.stage.addChild(torch);
app.ticker.add(() => {
    torch.rotation += 0.01;
});
appElement?.appendChild(app.view as HTMLCanvasElement);

appElement.addEventListener("click", () => {
    console.log(algo.stepThrough());
    console.log(algo.grid);
});
