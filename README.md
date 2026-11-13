# Flappy Bird · Cocos Creator 3.8.8

用 Cocos Creator 3.8.8 + TypeScript 实现的 Flappy Bird 小游戏，支持打包为 Android APK。

## 玩法

- 点击 / 触摸屏幕开始，之后每次点击让小鸟向上扇翅
- 穿过一组管道 +1 分；撞到管道或地面立即结束
- 结算显示本局得分、历史最高分和奖牌
- 点击 Play 重新开始

## 环境

| 项 | 版本 / 说明 |
| --- | --- |
| Cocos Creator | 3.8.8 |
| 语言 | TypeScript |
| 物理 | Box2D 2D（Cocos 内置） |
| Android SDK | API 36，ABI `arm64-v8a` |
| JDK | 17 |
| Gradle / AGP | 8.11.1 / 8.10.1（Cocos 3.8.8 模板） |

编辑器预览不需要额外 Node 依赖；Android 构建需要本机安装 SDK、NDK 和 JDK。

## 运行

1. 用 Cocos Dashboard 导入本目录，等待资源导入完成。
2. 打开 `assets/scenes/game.scene`。
3. 点击预览；鼠标点击等价于手机触摸。

## 构建 APK

在 Build 面板中使用以下参数：

| 参数 | 值 |
| --- | --- |
| 平台 | Android |
| 起始场景 | `assets/scenes/game.scene` |
| App Name | `Flappy Bird` |
| 包名 | `com.zuojt.flappybird` |
| API Level | 36 |
| ABI | `arm64-v8a` |
| 屏幕方向 | Portrait |
| App Bundle | 关闭（直接出 APK） |
| 签名 | Use Debug Keystore（演示包） |
| 输出目录 | `build/android-arm64` |

点击「构建」→「生成」。产物一般在：

```text
build/android-arm64/proj/build/cocos-flappy-bird/outputs/apk/release/cocos-flappy-bird-release.apk
```

路径不固定时直接搜索：

```powershell
Get-ChildItem build\android-arm64 -Recurse -Filter *.apk
```

安装并确认 APK 内含 arm64 原生库：

```powershell
$apk = Get-ChildItem build\android-arm64 -Recurse -Filter *.apk | Select-Object -First 1
adb install -r $apk.FullName

# Windows 10+ 自带 tar 可以读取 zip
tar -tf $apk.FullName | Select-String 'lib/arm64-v8a/libcocos.so'
```

> 当前构建配置是 `arm64-v8a`。如果要跑 x86_64 模拟器，请临时在 Build 面板勾选 x86_64，不要把它作为手机交付包。
>
> `useDebugKeystore` 只用于演示；正式发布请换成自己的 keystore，并避免把密码提交到仓库。
>
> 构建参数已提交在 `profiles/v2/packages/android.json`；`native/` 由 Cocos 构建时生成，未纳入 Git。

## 项目结构

```text
assets/
  scenes/game.scene          主场景
  prefabs/Pipe.prefab        管道（上下管 + 得分传感器）
  animation/Bird_idle.anim   小鸟三帧扇翅
  textures/                  背景、地面、管道、UI、奖牌
  audio/                     BGM 与音效
  scripts/
    GameManager.ts           状态机 / 分数 / UI / 音频编排
    GameEvents.ts            全局事件总线
    BirdController.ts        点击、刚体、碰撞
    PipeSpawn.ts             第一根预生成、间隔生成、暂停 / 启用
    PipeController.ts        管道左移与销毁
    GameData.ts              本局分数与最高分
    AudioMgr.ts              BGM / 音效双 AudioSource
    ScreenAdapter.ts         长屏适配
    BacgroundController.ts   背景 / 地面无缝滚动
    Tags.ts                  碰撞 tag 常量
    UI/GameReadyUI.ts        准备界面
    UI/GameOverUI.ts         结算界面
profiles/v2/packages/android.json  Android 构建参数
settings/v2/packages/              引擎模块、设计分辨率等
```

## 架构与流程

```text
GameReadyUI ─┐
BirdController ├─ gameEvents ─→ GameManager ─→ UI / Audio / PipeSpawn
GameOverUI ──┘
```

- `GameManager` 维护 `Ready → Playing → GameOver` 三态；重开时重新加载场景。
- Bird / UI 不反向依赖 `GameManager`，只发 `START / HIT / SCORE / REPLAY` 事件，避免循环依赖。
- 设计分辨率 `720 × 1280`，宽度固定（fitWidth）；`ScreenAdapter` 负责长屏下背景、地面和遮罩铺满。
- 管道由 `PipeSpawn` 预生成第一根，`GameManager` 进入 Playing 时统一启用并开始计时；GameOver 时统一暂停。
- 最高分通过 `sys.localStorage` 保存，Web 与原生通用；key 沿用旧版本的 `BsetScore`，避免已有存档丢失。
- `GameManager.addScore()` 按 `Playing` 状态兜底，鸟死后掉出得分传感器不会再加分。

## 已知限制 / 后续

- 目前主要针对竖屏手机调过；4:3 平板 / 折叠屏上顶部 UI 可能被裁切，需要 Widget、SafeArea 或 UI 层缩放。
- BGM 是 WAV（约 5.2 MB），转 OGG 可明显减小包体。
- 管道未使用对象池；低端机可加 `NodePool`。
- 切后台没有暂停 / 恢复；重开使用 `loadScene`，会有短暂黑帧。
- 当前为演示包：debug 签名、Cocos 默认启动画面；正式发布需替换 keystore、图标和启动图。

## 国内网络构建（可选）

如果构建卡在 Gradle 下载，本机 `tools/` 下有镜像辅助脚本，说明见其中的 README。该目录未纳入 Git，不影响游戏本身。
