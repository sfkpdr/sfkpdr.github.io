---
name: Wan2.2
slug: wan2-2
developer: Wan-AI（阿里巴巴）
summary: Apache-2.0 授权的开源视频生成模型家族，包含文生视频、图生视频与可在消费级显卡运行的 TI2V-5B。
tasks:
  - text-to-video
runtimes:
  - ComfyUI
  - Diffusers
license: Apache-2.0
licenseName: Apache License 2.0
licenseNote: 官方采用 Apache-2.0，并声明不对用户生成内容主张权利；使用仍需遵守许可条款与使用政策。
params: T2V / I2V-A14B 为 MoE 架构（总 27B，激活约 14B）；TI2V-5B 为稠密 5B
hardware: 待补充（本机尚未完整跑完 TI2V-5B 全流程）
pros:
  - Apache-2.0 授权，商用限制少
  - 提供 480P/720P 多档，5B 版本对消费级显卡友好
  - MoE 双专家设计，运动幅度与细节平衡较好
cons:
  - A14B 版本体积大，普通显卡基本跑不动
  - 5 秒片段需要拼接才能成片，长镜头一致性还要靠后续处理
  - 提示词需要写清镜头运动，否则容易出现主体漂移
modelUrl: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
codeUrl: https://github.com/Wan-Video/Wan2.2
docsUrl: https://arxiv.org/abs/2503.20314
status: published
tags:
  - 视频
  - 开源
  - 图生视频
relatedArticles: []
updated: 2026-10-12
---

## 版本怎么选

Wan2.2 不是单一模型，而是一组：

| 版本 | 类型 | 规模 | 适用场景 |
| --- | --- | --- | --- |
| T2V-A14B | 文生视频 | MoE，总 27B / 激活约 14B | 有明确文字脚本、需要电影感画面 |
| I2V-A14B | 图生视频 | 同上 | 已有静态图，希望它动起来 |
| TI2V-5B | 文 + 图生视频 | 稠密 5B | 消费级显卡（如 4090）跑 720P@24fps |

## 使用要点

- **镜头语言要写出来**：`slow push in`、`handheld`、`static wide shot` 这类描述对结果影响很大。
- **一次只改一个变量**：先定构图，再调运动，最后调光影。三个一起改会分不清是哪一项起了作用。
- **5 秒是常态**：需要更长的镜头，用首尾帧衔接或者分段生成后剪辑，不要指望单次生成十几秒还保持稳定。

## 许可证

官方采用 Apache-2.0，声明不对生成内容主张权利。但使用仍需遵守许可条款（不得用于违法内容、虚假信息等）。站内标注的硬件需求以实际跑过的记录为准，没跑过的不写。
