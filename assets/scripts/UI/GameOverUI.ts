import { _decorator, AudioClip, Component, Label, Node } from 'cc';
import { AudioMgr } from '../AudioMgr';
import { GameEvent, gameEvents } from '../GameEvents';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(Label)
    curScoreLabel: Label = null;
    @property(Label)
    bestScoreLabel: Label = null;
    @property([Node])
    medalArray: Node[] = [];
    @property(AudioClip)
    restartAudio: AudioClip = null;

    private _isReplaying: boolean = false;

    public show(currentScore: number, bestScore: number) {
        this.node.active = true;
        this.curScoreLabel.string = currentScore.toString();
        this.bestScoreLabel.string = bestScore.toString();

        // 结算界面可能被重复 show，先隐藏所有奖牌，避免多块奖牌同时亮起
        this.medalArray.forEach((medal) => {
            if (medal) medal.active = false;
        });

        //根据对应分数范围显示对应奖牌
        let count: number = Math.floor(currentScore / 10);
        if (count > 3) {
            count = 3;
        }
        if (this.medalArray[count]) {
            this.medalArray[count].active = true;
        }
    }

    public hide() {
        this.node.active = false;
    }

    onReplay() {
        if (this._isReplaying) return;
        this._isReplaying = true;

        AudioMgr.inst.playOneShot(this.restartAudio); // 重新开始音效
        // 由 GameManager 统一 loadScene，UI 不再负责游戏流程
        gameEvents.emit(GameEvent.REPLAY);
    }
}


