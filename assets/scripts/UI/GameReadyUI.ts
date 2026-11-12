import { _decorator, Component, input, Input } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameReadyUI')
export class GameReadyUI extends Component {
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        // 这个监听是挂在全局 input 上的，节点隐藏后依然会收到触摸；
        // 不加判断的话，点「重新开始」时会先把状态切到 Playing，表现会很怪。
        if (!this.node.active) {
            return;
        }
        // 触摸屏幕时，切换到游戏进行状态
        GameManager.instance().transitionToPlayingState();
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
}


