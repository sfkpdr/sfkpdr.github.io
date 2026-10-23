---
title: 苔绿森林场景插画
slug: moss-forest-illustration
model: flux1-dev
category: illustration
image: /images/prompts/moss-forest-illustration.webp
status: published
tested: false
tags:
  - 插画
  - 场景
  - 苔绿
  - 示例
prompt: >-
  quiet forest interior illustration, ancient trees covered with thick moss,
  soft volumetric light beams filtering through the canopy,
  muted olive green and warm grey palette, painterly brush strokes,
  layered depth with mist in the far background, small ferns in the foreground,
  storybook atmosphere, no characters, gentle desaturated color grading,
  flat illustration style with subtle paper texture
negative: >-
  photorealistic, oversaturated colors, harsh contrast, neon lighting,
  text, watermark, cluttered composition
params: |
  # 以下为起始参考值，本站尚未记录该条目的真实实测结果
  分辨率: 1024 × 768
  步数: 24
  guidance: 3.5
relatedArticles: []
relatedProjects: []
updated: 2026-10-18
---

## 场景插画的三个控制点

**色调先行**：先定 `muted olive green and warm grey palette` 这类色板描述，画面基调就稳了一半。
只写「森林」，模型很容易给出高饱和的绿色。

**层次**：`layered depth with mist in the far background` 是廉价但有效的空气透视写法，
前景蕨类、中景苔藓树干、远景雾气，三层就够撑起空间感。

**风格归属**：`painterly brush strokes` 与 `flat illustration style` 不能同时用，
这两个词互相冲突，会导致画面一半写实一半扁平。选一个，再补 `paper texture` 之类的细节。

## 常见问题

- **画面发脏**：通常是同时写了 `painterly` 和 `photorealistic`，二选一。
- **绿色过饱和**：把 `moss` 换成 `sage` 或 `olive`，并加 `desaturated`。
- **没有纵深感**：补一句前景物体的具体描述，比加 `depth of field` 有效。

## 说明

本条是站内示例条目：图片为占位示意图，参数未经本机实测。
