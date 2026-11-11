import { _decorator, Component, instantiate, math, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PipeSpawn')
export class PipeSpawn extends Component {
    @property(Prefab)
    pipePrefab: Prefab | null = null;

    @property
    spawnInterval: number = 0.5; // 间隔时间，单位为秒

    private timer: number = 0;

    start() {

    }

    update(deltaTime: number) {
        this.timer += deltaTime;
        if (this.timer >= this.spawnInterval) {
            this.timer = 0; // 重置计时器
            const pipeNode = instantiate(this.pipePrefab);
            this.node.addChild(pipeNode);
            const pos = this.node.getWorldPosition(); // 获取父节点的世界位置
            pipeNode.setWorldPosition(pos); // 设置管道的世界位置为父节点的位置
            const y = math.randomRangeInt(-100, 200); // 随机高度，范围可以根据需要调整
            pipeNode.setPosition(pipeNode.getPosition().x, y); // 设置管道的随机高度
        }
    }
}

