import { _decorator, Collider2D, Component, Contact2DType, input, Input, IPhysics2DContact, RigidBody2D, Vec2, Animation } from 'cc';
import { GameManager } from './GameManager';
import { Tags } from './Tags';
const { ccclass, property } = _decorator;

@ccclass('BirdController')
export class BirdController extends Component {
    private Red2D:RigidBody2D = null;
    private _Animation:Animation = null;

    @property
    rorateSpeed: number = 60; // 小鸟旋转速度

    private _isControlEnabled: boolean = true; // 控制小鸟是否可以被控制

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        // 注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        this.Red2D = this.getComponent(RigidBody2D); // 获取刚体组件
        this._Animation = this.getComponent(Animation); // 获取动画组件
    }

    start() {
        
    }

    update(deltaTime: number) {
        if (!this._isControlEnabled) return;
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
        // 注销碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onTouchStart() {
        if (!this._isControlEnabled) return;
        // 点击给小鸟Y轴一个向上的速度
        this.Red2D.linearVelocity = new Vec2(0, 10);
        this.node.angle = 30; // 点击时小鸟向上倾斜30度
    }

    public enableControl() {
        this._isControlEnabled = true;
        this.Red2D.enabled = true; // 启用刚体
        this._Animation.enabled = true; // 播放动画
    }
    public disableControl() {
        this._isControlEnabled = false;
        this.Red2D.enabled = false; // 禁用刚体
        this._Animation.enabled = false; // 停止动画
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
        if (otherCollider.tag === Tags.SCORE) {
            console.log("通过管道，得分");
            // 在这里可以添加得分的逻辑，比如增加分数、更新UI等
            GameManager.instance().addScore();
        }
    }
}


