import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(Label)
    curScoreLabel: Label = null;
    @property(Label)
    bestScoreLabel: Label = null;

    public show(currentScore: number, bestScore: number) {
        this.node.active = true;
        this.curScoreLabel.string = currentScore.toString();
        this.bestScoreLabel.string = bestScore.toString();
    }

    public hide() {
        this.node.active = false;
    }
}


