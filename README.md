# 华夏英杰传 - 3D MOBA 网页游戏

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-r128-blue?style=flat-square&logo=three.js" />
  <img src="https://img.shields.io/badge/HTML5-Game-orange?style=flat-square&logo=html5" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript" />
  <img src="https://img.shields.io/badge/50位英雄-8种职业-red?style=flat-square" />
</p>

## 游戏介绍

《华夏英杰传》是一款基于 **Three.js** 开发的 **3D MOBA 网页游戏**，玩家可以操控中国历史名将，在经典三路战场上与敌方英雄对战，摧毁敌方水晶获得胜利。

### 核心特色

- **50位历史英雄**：秦始皇、关羽、诸葛亮、李白、花木兰等50位华夏英杰
- **8种英雄职业**：皇帝、武将、谋士、美人、刺客、名医、工匠、诗人
- **三路MOBA战场**：上路、中路、下路，防御塔、水晶、兵线系统
- **装备商店系统**：基地购买装备，属性叠加，策略搭配
- **4级难度选择**：简单/普通/困难/噩梦，AI智能逐级提升
- **3v3 / 5v5 模式**：灵活选择对战规模
- **独特技能特效**：每位英雄4个技能，各有独特Three.js动画效果
- **智能AI系统**：友方和敌方AI会巡逻、攻击、回城、购买装备

## 在线访问 / Online Access

| 地区 | 链接 | 状态 |
|------|------|------|
| 🌍 国际 / International | [GitHub Pages](https://jsoned.github.io/huaxia-yingjie/) | 全球访问 |
| 🇨🇳 国内 / China | [Gitee Pages](https://jsoned.gitee.io/huaxia-yingjie/) | 国内加速 |
| 📦 源码 / Source | [GitHub Repo](https://github.com/Jsoned/huaxia-yingjie) | 开源代码 |

## 快速开始 / Quick Start

### 在线试玩 / Play Online

直接点击上方链接即可开始游戏：

```bash
# 方式1：直接双击打开（部分功能受限）
# 方式2：使用本地服务器（推荐）
python -m http.server 8080
# 然后访问 http://localhost:8080/华夏英杰传_完整版.html
```

### 本地部署

```bash
# 克隆仓库
git clone https://github.com/你的用户名/华夏英杰传.git

# 进入目录
cd 华夏英杰传

# 启动本地服务器
python -m http.server 8080

# 浏览器访问
# http://localhost:8080/华夏英杰传_完整版.html
```

## 操作指南 / Controls

| 按键 / Key | 功能 / Function |
|-----------|----------------|
| `W/A/S/D` | 移动 / Move |
| `鼠标左键` / `Left Click` | 普攻（点击敌人）/ Attack |
| `1/2/3/4` | 释放技能 / Cast Skill |
| `Shift` | 加速移动 / Sprint |
| `E` | 回城（4秒读条）/ Recall |
| `B` | 打开商店 / Open Shop |
| `L` | 锁定/解锁视角 / Lock Camera |
| `Tab` | 战绩面板 / Scoreboard |
| `M` | 大地图 / Big Map |
| `H` | 按键提示 / Key Hints |
| `ESC` | 暂停菜单 / Pause |

## 玩法介绍 / How to Play

### 游戏目标 / Objective
**中文**：摧毁敌方水晶，同时保护己方水晶！控制你的英雄在三路战场上推进，击杀敌人，摧毁防御塔，最终取得胜利。

**English**: Destroy the enemy crystal while protecting your own! Control your hero on the three-lane battlefield, kill enemies, destroy towers, and achieve victory.

### 核心玩法 / Core Gameplay
1. **选择英雄 / Choose Hero**: 50位历史英雄，8种职业
2. **三路推进 / Three Lanes**: 上路、中路、下路，选择你的路线
3. **击杀小兵 / Kill Minions**: 每30秒一波小兵，击杀获得金币
4. **购买装备 / Buy Items**: 按B打开商店，用金币提升属性
5. **摧毁防御塔 / Destroy Towers**: 推倒敌方防御塔推进战线
6. **团队协作 / Teamwork**: 友方AI会配合你作战
7. **回城恢复 / Recall**: 血量低时按E回城恢复

### 获胜技巧 / Winning Tips
- **合理选路**: 根据英雄特点选择路线
- **控制兵线**: 不要让敌方小兵推进到己方塔下
- **及时回城**: 血量低时及时回城，避免被击杀
- **积累金币**: 击杀小兵和英雄获得金币购买装备
- **团队配合**: 与友方AI配合，集中火力攻击
- **优先推塔**: 摧毁敌方防御塔是获胜关键

## 英雄列表

### 皇帝（11位）
秦始皇、汉武帝、唐太宗、武则天、朱元璋、曹操、孙权、刘备、康熙、赵匡胤、嬴政

### 武将（15位）
项羽、关羽、岳飞、霍去病、李靖、吕布、韩信、赵云、成吉思汗、戚继光、花木兰、穆桂英、郑成功、班超、卫青

### 谋士（9位）
诸葛亮、张良、姜子牙、范蠡、周瑜、孙武、吴起、商鞅、鬼谷子

### 美人（6位）
西施、王昭君、貂蝉、杨玉环、妲己、褒姒

### 刺客（5位）
荆轲、专诸、豫让、聂政、要离

### 名医（5位）
扁鹊、华佗、张仲景、孙思邈、李时珍

### 工匠（5位）
鲁班、墨子、马钧、黄道婆、李春

### 诗人（4位）
李白、屈原、苏轼、杜甫

## 技术栈

- **Three.js** - 3D渲染引擎
- **HTML5 Canvas** - 2D UI绘制
- **Web Audio API** - 音效系统
- **WebSocket** - 联机对战（开发中）
- **LocalStorage** - 本地数据存储

## 项目结构

```
华夏英杰传/
├── 华夏英杰传_完整版.html    # 主游戏文件（HTML+CSS）
├── game.js                    # 游戏逻辑（JavaScript）
├── README.md                  # 项目说明
└── docs/                      # 设计文档
    ├── 华夏英杰传_MOBA客户端架构设计.md
    └── 华夏英杰传_Unity项目资源清单与快速启动指南.md
```

## 游戏截图

> 截图将在后续版本补充

## 更新日志

### v1.0.0 (2025-01)
- 50位英雄完整上线
- 三路MOBA战场系统
- 装备商店系统
- 4级难度AI
- 3v3 / 5v5 对战模式
- 独特技能特效系统

## 开发计划

- [ ] 联机对战系统完善
- [ ] 更多地图场景
- [ ] 排位赛系统
- [ ] 英雄皮肤系统
- [ ] 移动端适配

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 项目主页：[GitHub仓库地址]
- 问题反馈：[Issues页面]

---

<p align="center">
  <b>华夏英杰传 - 传承千年英雄梦</b>
</p>
