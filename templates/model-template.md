---
# ===== 必填 =====
name: 模型官方名称
slug: model-slug
developer: 开发团队
summary: 一句话说清它擅长什么、适合谁用。
license: Apache-2.0
modelUrl: https://huggingface.co/xxx/yyy
status: draft
updated: 2026-10-23

# ===== 选填 =====
licenseName: Apache License 2.0
licenseNote: 说明能不能商用、有什么附加限制；不确定就写「以官方 LICENSE 为准」。
params: 20B（BF16），社区另有 FP8 / GGUF 量化
hardware: 只写自己实测的环境，没跑过就留空
tasks:
  - text-to-image
runtimes:
  - ComfyUI
  - Diffusers
pros:
  - 优点一
cons:
  - 局限一
codeUrl: https://github.com/xxx/yyy
docsUrl: https://example.com/docs
tags:
  - 生图
relatedArticles:
  - comfyui-first-workflow
---

## 能力与适用场景

适合做什么、不适合做什么。

## 部署方式

给出可复制的命令或步骤。

## 使用建议

参数起点、常见坑。
