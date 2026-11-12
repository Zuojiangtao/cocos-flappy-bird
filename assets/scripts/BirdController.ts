 import { _decorator, Collider2D, Component, Contact2DType, input, Input, IPhysics2DContact, Node, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BirdController')
export class BirdController extends Component {
    private Red2D:RigidBody2D = null;

    @property
    rorateSpeed: number = 60; // 小鸟旋转速度

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        // 注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
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

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log("碰撞开始::==================");
        console.log("碰撞的对象是: " + otherCollider.node.name, "碰撞的对象的tag是: " + otherCollider.tag);
        // 碰撞检测逻辑
        if (otherCollider.node.name === "Floor" || otherCollider.node.name === "Pipe") {
            console.log("游戏结束");
            // 在这里可以添加游戏结束的逻辑，比如停止游戏、显示游戏结束界面等
        }
    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log("碰撞结束::");
    }
}


