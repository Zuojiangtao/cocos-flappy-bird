import { _decorator, Component, Label, math, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(Label)
    curScoreLabel: Label = null;
    @property(Label)
    bestScoreLabel: Label = null;
    @property([Node])
    medalArray: Node[] = [];

    public show(currentScore: number, bestScore: number) {
        this.node.active = true;
        this.curScoreLabel.string = currentScore.toString();
        this.bestScoreLabel.string = bestScore.toString();

        //根据对应分数范围显示对应奖牌
        let count: number = Math.floor(currentScore / 10);
        if (count > 3) {
            count = 3;
        }
        this.medalArray[count].active = true;
    }

    public hide() {
        this.node.active = false;
    }
}


