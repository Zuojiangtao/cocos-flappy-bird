import { sys } from 'cc';

/**
 * 游戏数据。
 *
 * 最高分以前直接用 window.localStorage，在原生平台虽然也能用，但
 * 更推荐走 sys.localStorage（Web / 原生 / 小游戏都由引擎适配好），
 * 这里再做一层 try/catch，存储不可用时也不会让游戏崩掉。
 */
export class GameData {
    private static _score: number = 0;

    private static readonly BEST_SCORE: string = 'BestScore';
    /** 旧版本 key，读取时自动迁移，避免已有最高分丢失 */
    private static readonly LEGACY_BEST_SCORE: string = 'BsetScore';

    public static getScore(): number {
        return this._score;
    }

    public static addScore(value: number = 1): void {
        this._score += value;
    }

    public static resetScore(): void {
        this._score = 0;
    }

    /**
     * 保存本局分数，并返回最新的历史最高分。
     * 返回值的意义：结算界面可以直接显示这次刷新后的最高分，
     * 而不是显示保存前的旧值。
     */
    public static setScore(): number {
        const curScore = this.getScore();
        const bestScore = this.getBestScore();

        if (curScore > bestScore) {
            this.write(this.BEST_SCORE, curScore.toString());
            this.remove(this.LEGACY_BEST_SCORE);
            return curScore;
        }
        return bestScore;
    }

    public static getBestScore(): number {
        const value = this.read(this.BEST_SCORE) ?? this.read(this.LEGACY_BEST_SCORE);
        if (!value) {
            return 0;
        }

        const score = parseInt(value, 10);
        return Number.isFinite(score) ? score : 0;
    }

    private static read(key: string): string | null {
        try {
            return sys.localStorage.getItem(key);
        } catch (e) {
            console.warn('[GameData] 读取本地存档失败', e);
            return null;
        }
    }

    private static write(key: string, value: string): void {
        try {
            sys.localStorage.setItem(key, value);
        } catch (e) {
            console.warn('[GameData] 写入本地存档失败', e);
        }
    }

    private static remove(key: string): void {
        try {
            sys.localStorage.removeItem(key);
        } catch (e) {
            console.warn('[GameData] 清理旧存档失败', e);
        }
    }
}
