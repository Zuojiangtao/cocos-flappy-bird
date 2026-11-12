import { _decorator, Component, Label, Node } from 'cc';
import { BacgroundController } from './BacgroundController';
import { BirdController } from './BirdController';
import { PipeSpawn } from './PipeSpawn';
import { GameReadyUI } from './UI/GameReadyUI';
import { GameData } from './GameData';
import { GameOverUI } from './UI/GameOverUI';
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
    @property(GameOverUI)
    gameOverUI: GameOverUI = null;

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
        this.currentState = GameState.Ready; // 游戏状态切换为准备中

        this.bird.disableControl(); // 禁用小鸟的控制
        this.backgroundMoving.disableMovement(); // 禁用背景的移动
        this.floorMoving.disableMovement(); // 禁用地面的移动
        this.pipeSpawn.pauseSpawning(); // 暂停管道生成

        this.gameReadyUI?.show(); // 显示游戏准备界面
        this.gamingUI.active = false; // 隐藏游戏进行界面
        this.gameOverUI?.hide(); // 隐藏游戏结束界面
    }
    transitionToPlayingState() {
        this.currentState = GameState.Playing; // 游戏状态切换为进行中

        this.bird.enableControl(); // 启用小鸟的控制
        this.backgroundMoving.enableMovement(); // 启用背景的移动
        this.floorMoving.enableMovement(); // 启用地面的移动
        this.pipeSpawn.resumeSpawning(); // 恢复管道生成

        this.gameReadyUI?.hide(); // 隐藏游戏准备界面
        this.gamingUI.active = true; // 显示游戏进行界面
        this.gameOverUI?.hide(); // 隐藏游戏结束界面

        this.gamingScore.string = GameData.getScore().toString(); // 初始化分数显示
    }
    transitionToGameOverState() {
        if(this.currentState === GameState.GameOver) return;

        this.currentState = GameState.GameOver; // 游戏状态切换为游戏结束

        this.bird.disableControlNotRGD(); // 禁用小鸟的控制
        this.backgroundMoving.disableMovement(); // 禁用背景的移动
        this.floorMoving.disableMovement(); // 禁用地面的移动
        this.pipeSpawn.pauseSpawning(); // 暂停管道生成
       
        this.gameReadyUI?.hide();
        this.gamingUI.active = false; // 隐藏游戏进行界面
        this.gameOverUI?.show(GameData.getScore(), GameData.getBestScore()); // 显示游戏结束界面

        GameData.setScore();
    }

    addScore(count: number = 1) {
        GameData.addScore(count);
        this.gamingScore.string = GameData.getScore().toString();
    }
}
