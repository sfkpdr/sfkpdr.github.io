---
title: ControlNet 精准控制画面构图技巧
slug: controlnet-composition
summary: ControlNet 是 AI 绘图中非常强大的工具，可以精准控制画面的构图、姿势和风格。这篇会整理我在学习过程中总结的实用技巧。
category: image-tips
tags:
  - ControlNet
  - 构图
  - 技巧
date: 2026-05-10
models: []
prompts: []
featured: false
status: draft
---

> 这篇是旧站迁移过来的条目，目前只有摘要。正文还在补写中，补齐后把 `status` 改为 `published` 即可发布。

ControlNet 是 AI 绘图中非常强大的工具，可以精准控制画面的构图、姿势和风格。
我将分享我在学习过程中总结的实用技巧，帮助你更好地控制生成结果。

## 待补充的大纲

- 常用预处理器（Canny / Depth / OpenPose / Lineart）分别适合什么场景
- 控制权重与起止步数的搭配
- 一张参考图同时接两个 ControlNet 时的注意事项
- 姿态图不匹配时的处理方式
