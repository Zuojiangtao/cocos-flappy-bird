import { _decorator, Camera, Component, Node, UITransform, view } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PipeController')
export class PipeController extends Component {
    @property
    private pipeSpeed: number = 100;

    start() {
        this.pipeSpeed = GameManager.score.moveSpeed;
    }

    update(deltaTime: number) {
        const pos = this.node.position;
        this.node.setPosition(pos.x - this.pipeSpeed * deltaTime, pos.y, 0);
    }
}

