import { _decorator, Component, Label, Node } from 'cc';
import { BacgroundController } from './BacgroundController';
import { BirdController } from './BirdController';
import { PipeSpawn } from './PipeSpawn';
import { GameReadyUI } from './UI/GameReadyUI';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

enum GameState {
    Ready,
    Playing,
    GameOver
}

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager = null;
    public static instance() {
        return GameManager._instance;
    }

    @property
    moveSpeed: number = 100;
    @property(BirdController)
    bird: BirdController = null;
    @property(BacgroundController)
    backgroundMoving: BacgroundController = null;
    @property(BacgroundController)
    floorMoving: BacgroundController = null;
    @property(PipeSpawn)
    pipeSpawn: PipeSpawn = null;
    @property(GameReadyUI)
    gameReadyUI: GameReadyUI = null;
    @property(Node)
    gamingUI: Node = null;
    @property(Label)
    gamingScore: Label = null;

    currentState: GameState = GameState.Ready;

    onLoad() {
        GameManager._instance = this;
    }

    start() {
        // 统一把速度下发给背景/地面：
        // 它们不再反向 import GameManager，这样两边就不会形成循环依赖
        if (this.backgroundMoving) {
            this.backgroundMoving.setSpeed(this.moveSpeed);
        }
        if (this.floorMoving) {
            this.floorMoving.setSpeed(this.moveSpeed);
        }

        this.transitionToReadyState();
    }

    update(deltaTime: number) {
        
    }

    transitionToReadyState() {
        this.currentState = GameState.Ready;
        this.bird.disableControl(); // 启用小鸟的控制
        this.backgroundMoving.disableMovement(); // 启用背景的移动
        this.floorMoving.disableMovement(); // 启用地面的移动
        this.pipeSpawn.pauseSpawning(); // 暂停管道生成
        this.gamingUI.active = false; // 隐藏游戏进行界面
        if (this.gameReadyUI) {
            this.gameReadyUI.node.active = true; // 显示游戏准备界面
        }
    }
    transitionToPlayingState() {
        this.currentState = GameState.Playing;
        this.bird.enableControl(); // 禁用小鸟的控制
        this.backgroundMoving.enableMovement(); // 禁用背景的移动
        this.floorMoving.enableMovement(); // 禁用地面的移动
        this.pipeSpawn.resumeSpawning(); // 恢复管道生成
        this.gamingUI.active = true; // 显示游戏进行界面
        this.gamingScore.string = GameData.getScore().toString(); // 初始化分数显示
        // 隐藏游戏准备界面
        if (this.gameReadyUI) {
            this.gameReadyUI.node.active = false;
        }
    }
    transitionToGameOverState() {
        this.currentState = GameState.GameOver;
        this.bird.disableControl(); // 禁用小鸟的控制
        this.backgroundMoving.disableMovement(); // 禁用背景的移动
        this.floorMoving.disableMovement(); // 禁用地面的移动
        this.pipeSpawn.pauseSpawning(); // 暂停管道生成
    }

    addScore(count: number = 1) {
        GameData.addScore(count);
        this.gamingScore.string = GameData.getScore().toString();
    }
}
