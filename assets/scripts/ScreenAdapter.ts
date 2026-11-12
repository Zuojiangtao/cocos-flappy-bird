import { Canvas, Node, UITransform, view } from 'cc';

/**
 * 长屏 / 异形屏适配。
 *
 * 设计分辨率是 720x1280（16:9），在 20:9 这类长屏上，引擎会把画布高度
 * 扩展到 1600 设计单位（宽度仍然按 720 铺满），但背景图和地面只有 1280 高，
 * 于是屏幕上下各剩下 160 设计单位的黑色区域。
 *
 * 这个工具在场景启动时做三件事：
 * 1. 把背景纵向拉伸到整个可见高度，填满上下的空白；
 * 2. 把地面贴到屏幕最底部；
 * 3. 把准备/结算界面的半透明遮罩铺满全屏，避免遮罩边缘露出没压暗的区域。
 *
 * 注意：这里用 Canvas 上相机的 orthoHeight 来算可见高度，而不是
 * view.getVisibleSize()。因为在原生平台上相机实际看到的区域可能比
 * visibleSize 更大，用相机的值才能保证背景真正铺满。
 */
export class ScreenAdapter {
    /**
     * 按当前屏幕尺寸调整场景布局。
     * @param canvasNode 场景里的 Canvas 节点
     * @returns 当前可见高度（设计单位）
     */
    public static fit(canvasNode: Node | null): number {
        if (!canvasNode) {
            return 0;
        }

        const visibleHeight = this.getVisibleHeight(canvasNode);
        const visibleWidth = view.getVisibleSize().width;

        // 1. 背景：两张背景图都要拉高，滚动逻辑只改 x，不受影响
        const bg = canvasNode.getChildByName('Bg');
        bg?.children.forEach((child) => {
            const transform = child.getComponent(UITransform);
            if (transform) {
                transform.height = visibleHeight;
            }
        });

        // 2. 地面：保持原有高度，移动到屏幕底部
        const floor = canvasNode.getChildByName('Floor');
        floor?.children.forEach((child) => {
            const transform = child.getComponent(UITransform);
            const floorHeight = transform ? transform.height : 120;
            const position = child.position;
            child.setPosition(position.x, -visibleHeight / 2 + floorHeight / 2, position.z);
        });

        // 3. 半透明遮罩：铺满全屏
        ['GameReadyUI', 'GameOverUI'].forEach((name) => {
            const ui = canvasNode.getChildByName(name);
            ui?.children.forEach((child) => {
                if (child.name !== 'bg') {
                    return;
                }
                const transform = child.getComponent(UITransform);
                if (!transform) {
                    return;
                }
                transform.width = Math.max(transform.width, visibleWidth + 80);
                transform.height = visibleHeight;
            });
        });

        return visibleHeight;
    }

    /**
     * 取相机实际能看到的区域高度（设计单位）。
     * 相机还没初始化时退回 view 的可见高度。
     */
    public static getVisibleHeight(canvasNode: Node): number {
        const camera = canvasNode.getComponent(Canvas)?.cameraComponent;
        if (camera && camera.orthoHeight > 0) {
            return camera.orthoHeight * 2;
        }
        return view.getVisibleSize().height;
    }
}
