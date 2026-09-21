import { Level } from "./level.ts";

export class LevelPack {
    private _currentIndex: number;

    constructor(private _levels: Level[]) {
        if (_levels.length < 1) {
            throw new Error("there must be at least one level in a level pack");
        }

        this._currentIndex = 0;
    }

    get levelCount(): number {
        return this._levels.length;
    }

    get currentLevel(): Level {
        return this._levels[this._currentIndex];
    }

    hasNextLevel(): boolean {
        return this._currentIndex < this.levelCount - 1;
    }

    advance(): Level {
        if (!this.hasNextLevel()) {
            throw new Error("there is no next level to advance to");
        }

        this._currentIndex += 1;
        return this.currentLevel;
    }
}
