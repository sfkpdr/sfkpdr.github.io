---
title: ComfyUI 入门：从零搭起第一个可用工作流
slug: comfyui-first-workflow
summary: 从零开始理解 ComfyUI 的节点连接方式，用一张图讲清「模型 → 提示词 → 采样 → 出图」这条最基础的链路，以及每个节点到底在管什么。
category: comfyui
tags:
  - ComfyUI
  - 工作流
  - 入门
date: 2026-05-15
updated: 2026-10-18
models:
  - flux1-dev
prompts:
  - window-light-portrait
featured: true
status: published
---

## 先理解一件事：ComfyUI 是数据流，不是表单

大多数 AI 绘图 WebUI 是「填表」：选模型、填提示词、点生成。ComfyUI 不是。
它把一次生成拆成若干个节点，**每个节点负责一个动作，节点之间用连线传数据**。

所以第一次打开 ComfyUI 看到满屏连线时，不要慌——先找这条主链路：

```text
Checkpoint 加载器 → CLIP 文本编码（正向/负向）→ KSampler → VAE 解码 → 保存图像
                        ↑
                     空 Latent（决定尺寸）
```

只要这五个部分都在，你就能出图。其他所有节点，都是在这条链路上做加法。

## 五个必备节点分别在做什么

| 节点 | 作用 | 常见错误 |
| --- | --- | --- |
| Load Checkpoint | 加载主模型（含 UNet、CLIP、VAE） | 模型放错目录，列表里找不到 |
| Empty Latent Image | 决定出图宽高与批次 | 宽高不是 64 的倍数，报错或画面错位 |
| CLIP Text Encode | 把文字编码成条件 | 正负向接反，画面变成「反向」效果 |
| KSampler | 去噪采样，真正生成画面 | 步数与 CFG 乱调，越调越糊 |
| VAE Decode + Save Image | 把潜空间结果解成图片并保存 | 忘了接 Save，看不到输出 |

## 第一次跑通的检查清单

1. **模型放对位置**：主模型放 `models/checkpoints`，LoRA 放 `models/loras`，VAE 放 `models/vae`。放错目录时节点里根本看不到。
2. **尺寸从 1024×1024 或 1024×768 起步**：先确认流程能跑通，再追求特殊比例。
3. **步数先给 20–28**：这是多数整流流模型的舒适区，低于 10 步画面会发散。
4. **CFG / guidance 从 3.5 左右开始**：太高会出现过饱和和「油腻」质感，太低画面发灰。
5. **先不接 LoRA、ControlNet**：排错时变量越少越好。

## 三个新手最容易踩的坑

**坑一：红色节点不等于坏了。**
节点边框变红通常是「输入没接」或者「类型不匹配」。把鼠标移上去看提示，多数是忘了连 MODEL 或 CLIP。

**坑二：改了提示词没变化。**
检查 KSampler 的 `positive` / `negative` 是不是还连着旧的文本编码节点。复制节点后连线很容易接错。

**坑三：出图是纯黑或纯噪点。**
九成是 VAE 不匹配。有些模型自带 VAE 会出问题，换一个通用 VAE 立刻正常。

## 从「能出图」到「能复用」

跑通之后，把工作流保存成 JSON（菜单里的 Save），文件很小，可以随作品一起归档。
下次做同类画面时直接加载，只需要改提示词和尺寸——这比每次重新连线省太多时间。

站内的工作流条目都会附上这类 JSON 下载链接，配合对应的提示词条目一起看，恢复现场最快。
