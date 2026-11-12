import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class GameData {
    private static _score: number = 0;

    public static getScore() {
        return this._score;
    }

    public static setScore(value: number) {
        this._score = value;
    }

    public static resetScore() {
        this._score = 0;
    }

    public static addScore(value: number = 1) {
        this._score += value;
    }
}


