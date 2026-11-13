import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundController')
export class BackgroundController extends Component {
    @property(Node) bg1: Node = null;
    @property(Node) bg2: Node = null;
    private speed: number = 100;

    private bgWidth: number = 0;
    private _isMoving: boolean = true; // 背景是否移动

    /** 由 GameManager 调用，统一注入速度 */
    public setSpeed(speed: number) {
        this.speed = speed;
    }

    start() {
        const bg1Transform = this.bg1.getComponent(UITransform);
        this.bgWidth = bg1Transform.contentSize.width; // 获取背景图片的宽度

        // 初始化背景位置
        this.bg1.setPosition(0, this.bg1.position.y);
        this.bg2.setPosition(this.bgWidth, this.bg2.position.y);
    }

    update(deltaTime: number) {
        if (!this._isMoving) return; // 如果背景不移动，直接返回

        const moveDistance = this.speed * deltaTime;
        this.bg1.setPosition(this.bg1.position.x - moveDistance, this.bg1.position.y);
        this.bg2.setPosition(this.bg2.position.x - moveDistance, this.bg2.position.y);

        this.checkAndResetBackgrounds(this.bg1, this.bg2);
        this.checkAndResetBackgrounds(this.bg2, this.bg1);
    }

    checkAndResetBackgrounds(currentBg: Node, otherBg: Node) {
        if (currentBg.x <= -this.bgWidth) {
            const overshoot = currentBg.position.x + this.bgWidth;
            const newX = otherBg.position.x + this.bgWidth + overshoot;
            currentBg.setPosition(newX, currentBg.position.y);
        }
    }

    public enableMovement() {
        this._isMoving = true;
    }
    public disableMovement() {
        this._isMoving = false;
    }
}
