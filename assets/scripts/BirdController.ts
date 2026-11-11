 import { _decorator, Component, input, Input, Node, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BirdController')
export class BirdController extends Component {
    private Red2D:RigidBody2D = null;

    @property
    rorateSpeed: number = 60; // 小鸟旋转速度

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    start() {
        this.Red2D = this.getComponent(RigidBody2D); // 获取刚体组件
    }

    update(deltaTime: number) {
        // 根据小鸟的速度调整角度
        const velocity = this.Red2D.linearVelocity;
        this.node.angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI); // 将弧度转换为角度
        // 限制小鸟的最大旋转角度
        if (this.node.angle > 30) {
            this.node.angle = 30;
        } else if (this.node.angle < -60) {
            this.node.angle = -60;
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        // 点击给小鸟Y轴一个向上的速度
        this.Red2D.linearVelocity = new Vec2(0, 10);
        this.node.angle = 30; // 点击时小鸟向上倾斜30度
    }
}


