import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class GameData {
    private static _score: number = 0;

    private static readonly BSER_SCORE: string = 'BsetScore';

    public static getScore() {
        return this._score;
    }

    public static setScore() {
        const curScore = this.getScore();
        const bestSore = this.getBestScore();
        if(curScore > bestSore) {
            localStorage.setItem(this.BSER_SCORE, curScore.toString())
        }
    }

    public static resetScore() {
        this._score = 0;
    }

    public static addScore(value: number = 1) {
        this._score += value;
    }

    public static getBestScore() {
        const core = window.localStorage.getItem(this.BSER_SCORE);
        return core ? parseInt(core) : 0;
    }
}


