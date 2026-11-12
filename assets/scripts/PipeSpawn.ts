import { _decorator, Component, instantiate, math, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PipeSpawn')
export class PipeSpawn extends Component {
    @property(Prefab)
    pipePrefab: Prefab = null;

    /**
     * 相邻两组管道的生成间隔，单位是「秒」。
     *
     * 注意：屏幕上两组管道之间的距离 = spawnInterval × 管道移动速度。
     * 例如 spawnInterval = 1.5、速度 100px/s，间距只有 150px，
     * 在 720 宽的设计分辨率下同屏会看到 5 组左右，看起来就是「很多」。
     * 想要同屏 3 组左右，请把 spawnInterval 调到 2.2 ~ 2.5。
     *
     * 另外：这个值一旦被场景/预制体序列化，就以场景里 Inspector 上的值为准，
     * 改这里的默认值不会影响已经存在的 PipeSpawn 节点。
     */
    @property({ tooltip: '生成间隔（秒）；实际间距 = 该值 × 管道移动速度' })
    spawnInterval: number = 1.5;

    private timer: number = 0;

    start() {
        // 打印运行时真正生效的值，方便确认用的是场景里的值还是脚本默认值
        console.log(`[PipeSpawn] 实际生效的 spawnInterval = ${this.spawnInterval} 秒`);
    }

    update(deltaTime: number) {
        if (!this.pipePrefab) return;

        this.timer += deltaTime;
        if (this.timer < this.spawnInterval) return;

        // 减掉一个间隔而不是直接清零：长时间运行也不会累积误差
        this.timer -= this.spawnInterval;
        // 卡顿或切后台回来时，最多只补生成一根，避免一次性喷出一大排
        if (this.timer > this.spawnInterval) {
            this.timer = 0;
        }

        this.spawnPipe();
    }

    private spawnPipe() {
        const pipeNode = instantiate(this.pipePrefab);
        this.node.addChild(pipeNode); // 加到生成器节点下，位置以生成器为原点
        // 生成器节点就是出生点：x 固定为 0（跟随生成器），y 做随机上下偏移
        pipeNode.setPosition(0, math.randomRangeInt(-100, 200), 0);
    }
}
