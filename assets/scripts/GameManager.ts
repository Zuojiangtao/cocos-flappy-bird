import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _score: GameManager = null;
    public static get score() {
        return GameManager._score;
    }

    @property
    moveSpeed: number = 100;

    onLoad() {
        GameManager._score = this;
    }

    update(deltaTime: number) {
        
    }
}
