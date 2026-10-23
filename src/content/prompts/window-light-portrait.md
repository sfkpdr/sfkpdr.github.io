---
title: 窗边自然光人像
slug: window-light-portrait
model: qwen-image
category: portrait
image: /images/prompts/window-light-portrait.webp
status: published
tested: false
tags:
  - 人像
  - 自然光
  - 写实
  - 示例
prompt: >-
  editorial portrait of a young asian woman standing beside a large window,
  soft diffused afternoon light from camera left, sheer linen curtain diffusing the light,
  warm beige and cream color palette, natural skin texture with visible pores,
  85mm lens, f/2.0, shallow depth of field, eyes in sharp focus and looking slightly off camera,
  minimal makeup, relaxed shoulders, quiet and contemplative mood,
  film grain, muted highlights, no harsh shadows
negative: >-
  over-smoothed skin, plastic texture, heavy makeup, harsh flash, blown highlights,
  extra fingers, distorted hands, watermark, text, low resolution
params: |
  # 以下为起始参考值，本站尚未记录该条目的真实实测结果
  分辨率: 1328 × 1328
  步数: 50
  true_cfg_scale: 4.0
relatedArticles:
  - comfyui-first-workflow
relatedProjects: []
updated: 2026-10-20
---

## 为什么这样写

窗光人像最容易翻车的地方是**光比**。提示词里把光源方向（camera left）、柔光介质（sheer linen curtain）、
光比（no harsh shadows）都写清楚，模型就不会自作主张打一个正面硬光。

- `natural skin texture with visible pores` 用来压掉过度磨皮，比在负向词里反复写 `smooth skin` 更有效。
- 镜头参数（85mm / f/2.0）对景深影响明显，想要环境人像就换成 35mm / f/4。
- 光线描述的顺序建议：方向 → 质感 → 阴影，模型对这三段的响应最稳定。

## 调整建议

| 想要的效果 | 改动 |
| --- | --- |
| 更强的黄昏暖调 | 把 `afternoon light` 换成 `golden hour backlight`，并加 `warm rim light` |
| 冷调清透 | 加 `cool morning light, slight blue cast in shadows` |
| 半身改特写 | 加 `close-up, shoulders only`，同时把镜头换成 `135mm` |
| 更强的胶片感 | 加 `kodak portra 400, fine grain, slightly faded shadows` |

## 说明

本条是站内示例条目：图片为占位示意图，参数未经本机实测。请把它替换成你自己的效果图与跑通后的参数。
