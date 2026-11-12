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
        // 触摸屏幕时，切换到游戏进行状态
        GameManager.instance().transitionToPlayingState();
    }
}


