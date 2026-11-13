import { _decorator, AudioClip, Component, director, Label, Node } from 'cc';
import { BacgroundController } from './BacgroundController';
import { BirdController } from './BirdController';
import { PipeSpawn } from './PipeSpawn';
import { GameReadyUI } from './UI/GameReadyUI';
import { GameData } from './GameData';
import { GameOverUI } from './UI/GameOverUI';
import { AudioMgr } from './AudioMgr';
import { ScreenAdapter } from './ScreenAdapter';
import { GameEvent, gameEvents } from './GameEvents';
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
    @property(AudioClip)
    bgAudio: AudioClip = null;
    @property(AudioClip)
    gameOverAudio: AudioClip = null;
    @property(AudioClip)
    scoreAudio: AudioClip = null; 

    currentState: GameState = GameState.Ready;
    private _isReplaying: boolean = false;

    onLoad() {
        GameManager._instance = this;

        // Bird / UI 通过事件通知 GameManager，避免它们反向 import 造成循环依赖
        gameEvents.on(GameEvent.START, this.handleStart, this);
        gameEvents.on(GameEvent.HIT, this.handleHit, this);
        gameEvents.on(GameEvent.SCORE, this.handleScore, this);
        gameEvents.on(GameEvent.REPLAY, this.handleReplay, this);
    }

    onDestroy() {
        gameEvents.off(GameEvent.START, this.handleStart, this);
        gameEvents.off(GameEvent.HIT, this.handleHit, this);
        gameEvents.off(GameEvent.SCORE, this.handleScore, this);
        gameEvents.off(GameEvent.REPLAY, this.handleReplay, this);

        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    start() {
        // 长屏适配：背景铺满上下、地面贴底，去掉模拟器/手机上下的黑边
        ScreenAdapter.fit(this.node.parent);

        // 统一把速度下发给背景/地面/管道：
        // 它们不再反向 import GameManager，这样两边就不会形成循环依赖
        if (this.backgroundMoving) {
            this.backgroundMoving.setSpeed(this.moveSpeed);
        }
        if (this.floorMoving) {
            this.floorMoving.setSpeed(this.moveSpeed);
        }
        if (this.pipeSpawn) {
            this.pipeSpawn.setSpeed(this.moveSpeed);
        }

        this.transitionToReadyState();
        AudioMgr.inst.play(this.bgAudio);
    }

    private handleStart() {
        // 只允许从准备状态进入游戏，避免重复点击重复开局
        if (this.currentState !== GameState.Ready) return;
        this.transitionToPlayingState();
    }

    private handleHit() {
        this.transitionToGameOverState();
    }

    private handleScore() {
        this.addScore();
    }

    private handleReplay() {
        if (this._isReplaying) return;
        this._isReplaying = true;

        const scene = director.getScene();
        if (scene) {
            director.loadScene(scene.name);
        }
    }

    update(deltaTime: number) {
        
    }

    transitionToReadyState() {
        this.currentState = GameState.Ready; // 游戏状态切换为准备中

        GameData.resetScore(); // 重新开局，分数从 0 开始

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
        this.bird.flap(); // 触发游戏的第一下点击也要扇翅膀，否则开局会直接往下掉
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

        // 先把分数保存下来并拿到最新的最高分，再显示结算界面，
        // 这样结算界面上的 BEST 就是本局刷新后的值（以前显示的是旧值）
        const currentScore = GameData.getScore();
        const bestScore = GameData.setScore();
        this.gameOverUI?.show(currentScore, bestScore); // 显示游戏结束界面

        // game over：先停 BGM，再播结算音效
        AudioMgr.inst.stop();
        AudioMgr.inst.playOneShot(this.gameOverAudio);
    }

    addScore(count: number = 1) {
        GameData.addScore(count);
        this.gamingScore.string = GameData.getScore().toString();
        AudioMgr.inst.playOneShot(this.scoreAudio); // 得分音效
    }
}
