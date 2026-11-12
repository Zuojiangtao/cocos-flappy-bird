import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager = null;
    public static instance() {
        return GameManager._instance;
    }

    @property
    moveSpeed: number = 100;

    onLoad() {
        GameManager._instance = this;
    }

    update(deltaTime: number) {
        
    }
}
