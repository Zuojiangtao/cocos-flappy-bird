import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class Tags {
    public static readonly FLOOR: number = 10; // 新增一个标签用于地面碰撞检测
    public static readonly PIPE: number = 20; // 新增一个标签用于管道碰撞检测
    public static readonly SCORE: number = 30; // 新增一个标签用于得分检测
}


