import { Assets, Rectangle, Texture } from "pixi.js";
import WaveFunctionCollapse, { Tileable } from "./WaveCollapse";

class MazeTile implements Tileable {
    texture: Texture;
    private _topSocket: string;
    private _rightSocket: string;
    private _leftSocket: string;
    private _bottomSocket: string;
    constructor(
        texture: Texture,
        topSocket: string,
        rightSocket: string,
        bottomSocket: string,
        leftSocket: string
    ) {
        this._topSocket = topSocket;
        this._rightSocket = rightSocket;
        this._leftSocket = leftSocket;
        this._bottomSocket = bottomSocket;
        this.texture = texture;
    }
    get topSocket() {
        return this._topSocket;
    }
    get rightSocket() {
        return this._rightSocket;
    }
    get leftSocket() {
        return this._leftSocket;
    }
    get bottomSocket() {
        return this._bottomSocket;
    }
    roateRight(): MazeTile {
        return new MazeTile(
            this.texture,
            this.leftSocket,
            this.topSocket,
            this.rightSocket,
            this.bottomSocket
        );
    }
}

/**
 *
 * @param wallTexture the texure of the wall (should be vertical)
 * @returns all the tiles in all possible rotations
 */

function generateTiles(wallTexture: Texture): MazeTile[] {
    let walls: MazeTile[] = [];

    const createRotatedVariations = (tile: MazeTile): MazeTile[] => {
        const tiles: MazeTile[] = [];
        tiles.push(tile);
        Array(3)
            .fill(0)
            .forEach(() => {
                const lastOne = tiles[tiles.length - 1];
                tiles.push(lastOne.roateRight());
            });
        return tiles;
    };
    /**
     * one wall on the left => ║
     */
    walls = walls.concat(
        createRotatedVariations(new MazeTile(wallTexture, "0", "0", "0", "1"))
    );

    /**
     * left and right wall => ║ ║
     */
    const oppositeWallTile = new MazeTile(wallTexture, "0", "1", "0", "1");
    walls.push(oppositeWallTile, oppositeWallTile.roateRight());

    /**
     * corner walls => ╔
     */
    walls = walls.concat(
        createRotatedVariations(new MazeTile(wallTexture, "1", "0", "0", "1"))
    );

    /**
     * three sided walls => ⼕
     */
    walls = walls.concat(
        createRotatedVariations(new MazeTile(wallTexture, "1", "0", "1", "1"))
    );
    return walls;
}

const texture = await Assets.load<Texture>("cave_tileset.png");
const torchRectangle = new Rectangle(224, 128, 32, 32);
texture.frame = torchRectangle;

const tiles = generateTiles(texture);
export const algo = new WaveFunctionCollapse(tiles, 2);
