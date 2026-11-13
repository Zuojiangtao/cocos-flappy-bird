import { _decorator, AudioClip, Color, Component, director, Game, game, Graphics, Label, Node, tween, UIOpacity, UITransform, view } from 'cc';
import { BackgroundController } from './BackgroundController';
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
    @property
    moveSpeed: number = 100;
    @property(BirdController)
    bird: BirdController = null;
    @property(BackgroundController)
    backgroundMoving: BackgroundController = null;
    @property(BackgroundController)
    floorMoving: BackgroundController = null;
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
    private _pausedByHide: boolean = false;
    private _bgmPlaying: boolean = false;
    private _replayFade: Node = null;
    private _pauseHandler: (() => void) | null = null;
    private _resumeHandler: (() => void) | null = null;

    onLoad() {
        // Bird / UI 通过事件通知 GameManager，避免它们反向 import 造成循环依赖
        gameEvents.on(GameEvent.START, this.handleStart, this);
        gameEvents.on(GameEvent.HIT, this.handleHit, this);
        gameEvents.on(GameEvent.SCORE, this.handleScore, this);
        gameEvents.on(GameEvent.REPLAY, this.handleReplay, this);

        // Web / 编辑器预览：页面可见性事件
        game.on(Game.EVENT_HIDE, this.handleAppHide, this);
        game.on(Game.EVENT_SHOW, this.handleAppShow, this);

        // Android 原生：Cocos 3.8.8 的 CocosApplication::onPause 是空实现，
        // Game.EVENT_HIDE 不会触发，因此由 AppActivity 通过 JSB 调这两个全局函数。
        this._pauseHandler = () => this.handleAppHide();
        this._resumeHandler = () => this.handleAppShow();
        (globalThis as any).__flappyPause = this._pauseHandler;
        (globalThis as any).__flappyResume = this._resumeHandler;
    }

    onDestroy() {
        gameEvents.off(GameEvent.START, this.handleStart, this);
        gameEvents.off(GameEvent.HIT, this.handleHit, this);
        gameEvents.off(GameEvent.SCORE, this.handleScore, this);
        gameEvents.off(GameEvent.REPLAY, this.handleReplay, this);

        game.off(Game.EVENT_HIDE, this.handleAppHide, this);
        game.off(Game.EVENT_SHOW, this.handleAppShow, this);

        // 只清理自己挂上去的函数，避免场景重载时误删新 GameManager 的监听
        if ((globalThis as any).__flappyPause === this._pauseHandler) {
            delete (globalThis as any).__flappyPause;
        }
        if ((globalThis as any).__flappyResume === this._resumeHandler) {
            delete (globalThis as any).__flappyResume;
        }
        this._pauseHandler = null;
        this._resumeHandler = null;
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
        this._bgmPlaying = true;
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
        if (!scene) return;

        const fade = this.getReplayFade();
        const opacity = fade?.getComponent(UIOpacity);
        if (!opacity) {
            director.loadScene(scene.name);
            return;
        }

        // 先淡出到黑，再加载场景，避免直接 loadScene 的一帧黑屏
        tween(opacity)
            .to(0.2, { opacity: 255 })
            .call(() => director.loadScene(scene.name))
            .start();
    }

    private handleAppHide() {
        this._pausedByHide = this.currentState === GameState.Playing;
        if (this._pausedByHide) {
            director.pause();
        }
        if (this._bgmPlaying) {
            AudioMgr.inst.pause();
        }
    }

    private handleAppShow() {
        if (this._pausedByHide) {
            this._pausedByHide = false;
            director.resume();
        }
        if (this._bgmPlaying) {
            AudioMgr.inst.resume();
        }
    }

    private getReplayFade(): Node | null {
        if (this._replayFade && this._replayFade.isValid) {
            return this._replayFade;
        }

        const parent = this.node.parent;
        if (!parent) return null;

        const visibleSize = view.getVisibleSize();
        const fade = new Node('__replayFade__');
        fade.layer = this.node.layer; // 和 Canvas 子节点同一渲染层，UI 相机才可见
        parent.addChild(fade);
        fade.setSiblingIndex(parent.children.length - 1);

        const transform = fade.addComponent(UITransform);
        transform.setContentSize(visibleSize.width, visibleSize.height);

        const graphics = fade.addComponent(Graphics);
        graphics.fillColor = new Color(0, 0, 0, 255);
        graphics.rect(-visibleSize.width / 2, -visibleSize.height / 2, visibleSize.width, visibleSize.height);
        graphics.fill();

        const opacity = fade.addComponent(UIOpacity);
        opacity.opacity = 0;

        this._replayFade = fade;
        return fade;
    }

    transitionToReadyState() {
        this.currentState = GameState.Ready; // 游戏状态切换为准备中

        GameData.resetScore(); // 重新开局，分数从 0 开始

        this.bird.disableControl(); // 禁用小鸟的控制
        this.backgroundMoving.disableMovement(); // 禁用背景的移动
        this.floorMoving.disableMovement(); // 禁用地面的移动
        this.pipeSpawn.enterReadyState(); // 预生成第一根管道并暂停

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
        this.pipeSpawn.startPlaying(); // 恢复管道生成并启用预生成的管道

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

        // game over：先停 BGM；碰撞音效和结算音效错开，避免两个声音同时砸在一起
        AudioMgr.inst.stop();
        this._bgmPlaying = false;
        this.scheduleOnce(() => {
            AudioMgr.inst.playOneShot(this.gameOverAudio);
        }, 0.15);
    }

    addScore(count: number = 1) {
        // 游戏结束后，小鸟掉出得分传感器仍会触发 END_CONTACT，这里兜底
        if (this.currentState !== GameState.Playing) return;

        GameData.addScore(count);
        this.gamingScore.string = GameData.getScore().toString();
        AudioMgr.inst.playOneShot(this.scoreAudio); // 得分音效
    }
}
