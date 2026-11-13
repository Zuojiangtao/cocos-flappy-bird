//AudioMgr.ts
import { Node, AudioSource, AudioClip, resources, director } from 'cc';

/**
 * 音频管理单例。
 *
 * BGM 和音效使用两个独立的 AudioSource：
 * - BGM 的 stop()/play() 不会打断正在播放的点击、得分、结算音效；
 * - 重开时先播放的 restart 音效不会被新场景的 BGM 截断。
 */
export class AudioMgr {
    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }

    private _bgmSource: AudioSource;
    private _sfxSource: AudioSource;

    constructor() {
        // 常驻节点，场景切换时不会被销毁
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';
        director.getScene().addChild(audioMgr);
        director.addPersistRootNode(audioMgr);

        // BGM
        const bgmNode = new Node('bgm');
        audioMgr.addChild(bgmNode);
        this._bgmSource = bgmNode.addComponent(AudioSource);

        // 音效
        const sfxNode = new Node('sfx');
        audioMgr.addChild(sfxNode);
        this._sfxSource = sfxNode.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._bgmSource;
    }

    public get bgmSource() {
        return this._bgmSource;
    }

    public get sfxSource() {
        return this._sfxSource;
    }

    /**
     * @en play short audio, such as strikes, explosions
     * @zh 播放短音频，比如打击音效、爆炸音效等
     * @param sound clip or url for the audio
     * @param volume
     */
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._sfxSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._sfxSource.playOneShot(clip, volume);
                }
            });
        }
    }

    /**
     * @en play long audio, such as the bg music
     * @zh 播放长音频，比如背景音乐
     * @param sound clip or url for the sound
     * @param volume
     * @param loop 是否循环播放，背景音乐默认循环
     */
    play(sound: AudioClip | string, volume: number = 1.0, loop: boolean = true) {
        if (sound instanceof AudioClip) {
            this._bgmSource.stop();
            this._bgmSource.clip = sound;
            // AudioSource.play() 默认只播一遍，背景音乐必须显式打开 loop
            this._bgmSource.loop = loop;
            this._bgmSource.volume = volume;
            this._bgmSource.play();
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._bgmSource.stop();
                    this._bgmSource.clip = clip;
                    this._bgmSource.loop = loop;
                    this._bgmSource.volume = volume;
                    this._bgmSource.play();
                }
            });
        }
    }

    /**
     * 停止 BGM（不影响正在播放的音效）
     */
    stop() {
        this._bgmSource.stop();
    }

    /**
     * 暂停 BGM
     */
    pause() {
        this._bgmSource.pause();
    }

    /**
     * 恢复 BGM
     */
    resume() {
        this._bgmSource.play();
    }
}
