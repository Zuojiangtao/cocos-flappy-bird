# Flappy Bird · Cocos Creator 3.8.8

用 Cocos Creator 3.8.8 + TypeScript 实现的 Flappy Bird 小游戏，支持打包为 Android APK。仓库内附带两个可直接安装的 release 包（arm64-v8a / x86_64），无需配置环境也能先安装试玩。

## 下载安装

`releases/` 中提交了两种 ABI 的 release 构建（未开 debug，使用 Cocos 自带的 debug keystore 签名，versionName 1.0 / versionCode 1）：

| 文件 | ABI | 用途 | 大小 |
| --- | --- | --- | --- |
| [`cocos-flappy-bird-arm64-v8a-release.apk`](releases/cocos-flappy-bird-arm64-v8a-release.apk) | `arm64-v8a` | 手机 / 平板真机 | 约 11.3 MB |
| [`cocos-flappy-bird-x86_64-release.apk`](releases/cocos-flappy-bird-x86_64-release.apk) | `x86_64` | Android 模拟器 | 约 12.1 MB |

```powershell
# 手机真机（已开启 USB 调试并授权）
adb install -r releases\cocos-flappy-bird-arm64-v8a-release.apk

# Android 模拟器
adb install -r releases\cocos-flappy-bird-x86_64-release.apk
```

也可以直接把 APK 拷到手机上点击安装。

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
| Android SDK | API 36，ABI `arm64-v8a`（真机）/ `x86_64`（模拟器） |
| JDK | 17 |
| Gradle / AGP | 8.11.1 / 8.10.1（Cocos 3.8.8 模板） |

编辑器预览不需要额外 Node 依赖；Android 构建需要本机安装 SDK、NDK 和 JDK。

## 运行

1. 用 Cocos Dashboard 导入本目录，等待资源导入完成。
2. 打开 `assets/scenes/game.scene`。
3. 点击预览；鼠标点击等价于手机触摸。

## 构建 APK

在 Build 面板中使用以下参数，按目标 ABI 切换「App ABI」即可：

| 参数 | 值 |
| --- | --- |
| 平台 | Android |
| 起始场景 | `assets/scenes/game.scene` |
| App Name | `Flappy Bird` |
| 包名 | `com.zuojt.flappybird` |
| API Level | 36 |
| 屏幕方向 | Portrait |
| App Bundle | 关闭（直接出 APK） |
| 签名 | Use Debug Keystore（演示包） |

| 目标 ABI | Build 任务 / 输出目录 | 仓库内交付包 |
| --- | --- | --- |
| `arm64-v8a` | `android-arm64-v8a` → `build/android-arm64-v8a` | `releases/cocos-flappy-bird-arm64-v8a-release.apk` |
| `x86_64` | `android-x86_64` → `build/android-x86_64` | `releases/cocos-flappy-bird-x86_64-release.apk` |

安装并确认 APK 内含对应 ABI 的原生库：

```powershell
$apk = Get-ChildItem build\android-arm64-v8a -Recurse -Filter *.apk | Select-Object -First 1
adb install -r $apk.FullName

# Windows 10+ 自带 tar 可以读取 zip
tar -tf $apk.FullName | Select-String 'lib/arm64-v8a/libcocos.so'
# x86_64 包对应 lib/x86_64/libcocos.so
```

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
    BackgroundController.ts  背景 / 地面无缝滚动
    Tags.ts                  碰撞 tag 常量
    UI/GameReadyUI.ts        准备界面
    UI/GameOverUI.ts         结算界面
releases/
  cocos-flappy-bird-arm64-v8a-release.apk   真机交付包
  cocos-flappy-bird-x86_64-release.apk      模拟器交付包
profiles/v2/packages/android.json  本机 Build 面板状态（不纳入 Git）
settings/v2/packages/              引擎模块、设计分辨率等
build/                             本机构建产物（不纳入 Git）
```

## 架构与流程

```text
GameReadyUI ─┐
BirdController ├─ gameEvents ─→ GameManager ─→ UI / Audio / PipeSpawn
GameOverUI ──┘
```

- `GameManager` 维护 `Ready → Playing → GameOver` 三态；重开时先 0.2s 淡出到黑，再重新加载场景。
- 切后台：Android 由 `AppActivity` 通过 JSB 调用 `__flappyPause` / `__flappyResume`（Cocos 3.8.8 原生不会触发 `Game.EVENT_HIDE`）；Web / 编辑器仍走 `Game.EVENT_HIDE`。Playing 时暂停游戏循环，BGM 暂停 / 恢复。
- Bird / UI 不反向依赖 `GameManager`，只发 `START / HIT / SCORE / REPLAY` 事件，避免循环依赖。
- 设计分辨率 `720 × 1280`，宽度固定（fitWidth）；`ScreenAdapter` 负责长屏下背景、地面和遮罩铺满。
- 管道由 `PipeSpawn` 预生成第一根，`GameManager` 进入 Playing 时统一启用并开始计时；GameOver 时统一暂停。
- 最高分通过 `sys.localStorage` 保存，Web 与原生通用；新 key 为 `BestScore`，读取时自动兼容旧 `BsetScore`。
- `GameManager.addScore()` 按 `Playing` 状态兜底，鸟死后掉出得分传感器不会再加分。

## 已知限制 / 后续

- 目前主要针对竖屏手机调过；4:3 平板 / 折叠屏上顶部 UI 可能被裁切，需要 Widget、SafeArea 或 UI 层缩放。
- 管道未使用对象池；低端机可加 `NodePool`。
- Android 返回键仍直接退出；未做暂停菜单。
- 当前为演示包：debug 签名、versionCode 1 / versionName 1.0、Cocos 默认启动画面；正式发布需替换 keystore、图标和启动图，并升版本号。
