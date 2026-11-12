import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PipeController')
export class PipeController extends Component {
    @property({ tooltip: '管道 x 小于该值后销毁（相对父节点坐标）' })
    despawnX: number = -1000;

    private pipeSpeed: number = 100;

    start() {
        const manager = GameManager.instance();
        if (manager) {
            this.pipeSpeed = manager.moveSpeed;
        }
    }

    update(deltaTime: number) {
        const pos = this.node.position;
        const nextX = pos.x - this.pipeSpeed * deltaTime;
        this.node.setPosition(nextX, pos.y, 0);

        // 移出屏幕后销毁，否则管道会一直留在场景树里越积越多
        if (nextX < this.despawnX) {
            this.node.destroy();
        }
    }
}
