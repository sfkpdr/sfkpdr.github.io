---
title: 原木桌面产品静物
slug: wood-desk-product
model: flux1-dev
category: product
image: /images/prompts/wood-desk-product.webp
status: published
tested: false
tags:
  - 产品图
  - 静物
  - 木材
  - 示例
prompt: >-
  product photography of a matte ceramic mug on a solid walnut desk,
  morning side light raking across the wood grain from camera right,
  visible wood grain texture, a folded linen cloth in soft cream in the background,
  shallow depth of field, 100mm macro lens, f/4, neutral warm color grading,
  clean composition with generous negative space on the left,
  subtle shadow falloff, no props clutter, commercial catalog quality
params: |
  # 以下为起始参考值，本站尚未记录该条目的真实实测结果
  分辨率: 1024 × 768
  步数: 24
  guidance: 3.5
  采样器: euler / simple
relatedArticles: []
relatedProjects:
  - comfyui-basic-workflow
updated: 2026-10-19
---

## 关键在材质，不在物体

产品静物的提示词里，真正决定成败的是**材质词**和**光线角度**，而不是反复强调「高质感」。

- `matte ceramic` / `visible wood grain` 这类材质词比 `high quality` 有效得多。
- `side light raking across the wood grain` 是让木纹显形的关键：侧光会强化纹理，正光会把它压平。
- `generous negative space on the left` 是给后期留版位，做电商主图很实用。

## 换品类时怎么改

1. 把 `ceramic mug` 换成目标物体，材质词一起换（玻璃 / 不锈钢 / 织物 / 皮革）。
2. 台面材质按调性选：胡桃木偏高级，白橡木偏清爽，亚麻布偏生活感。
3. 需要更硬的商业感，把 `morning side light` 换成 `large softbox from top right`。

## 说明

本条是站内示例条目：图片为占位示意图，参数未经本机实测。请替换成你自己的实拍/生成结果。
