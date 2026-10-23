---
title: AI 生图基础工作流（ComfyUI）
slug: comfyui-basic-workflow
summary: 一条从零搭起的文生图基础链路：主模型加载、正负向提示词、采样与出图，尺寸与步数都调到了适合日常使用的稳定区间。
cover: /images/projects/comfyui-basic-workflow.webp
type: workflow
models:
  - flux1-dev
prompts:
  - wood-desk-product
articles:
  - comfyui-first-workflow
tags:
  - ComfyUI
  - 基础链路
  - 文生图
date: 2026-05-16
status: published
---

## 这条工作流解决什么问题

每次换主题都要重新连线太浪费时间。这条基础链路把「模型 → 提示词 → 采样 → 出图」固定下来，
换主题时只改提示词和尺寸，其他节点不动。

## 结构

```text
Load Checkpoint → CLIP Text Encode (正向 / 负向) → KSampler → VAE Decode → Save Image
                          ↑
                    Empty Latent Image
```

## 使用说明

1. 把主模型放到 `models/checkpoints`，在工作流的加载器里选中它。
2. 正向提示词写主体 + 材质 + 光线 + 镜头，负向只留真正要排除的东西（不要堆一大串）。
3. 尺寸先从 1024×768 开始，步数 24，guidance 3.5。
4. 出图后如果偏灰，先加 guidance；如果细节糊，先加步数，不要同时改两个。

## 注意事项

- 这条链路**没有**接 LoRA、ControlNet 和放大，属于最小可用版本；需要更精细控制时在这条链路上继续加节点。
- 工作流文件本身很小（几十 KB），可以放心随作品一起归档，但不要把模型权重一起提交到仓库。
