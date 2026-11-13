import { EventTarget } from 'cc';

/**
 * 全局游戏事件。
 *
 * GameManager 需要驱动 Bird / UI，而这些组件又要在状态变化时通知
 * GameManager。如果两边互相 import，会形成循环依赖，Cocos 会报
 * "Found possible circular reference"，@property 的类型也会退化成
 * undefined。这里用一个轻量的全局事件总线把方向统一成：
 * 组件 -> 事件 -> GameManager，脚本之间不再互相引用。
 */
export enum GameEvent {
    /** 点击开始 */
    START = 'game:start',
    /** 小鸟撞到管道或地面 */
    HIT = 'game:hit',
    /** 小鸟通过一根管道 */
    SCORE = 'game:score',
    /** 点击重新开始 */
    REPLAY = 'game:replay',
}

export const gameEvents = new EventTarget();
