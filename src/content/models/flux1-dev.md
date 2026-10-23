---
name: FLUX.1 [dev]
slug: flux1-dev
developer: Black Forest Labs
summary: 12B 的整流流 Transformer 文生图模型，提示词遵循度高、构图稳定，是非商用许可下最常用的开源生图基座之一。
tasks:
  - text-to-image
  - product
  - illustration
runtimes:
  - ComfyUI
  - Diffusers
license: FLUX.1 [dev] 非商用许可
licenseName: FLUX.1 [dev] Non-Commercial License
licenseNote: 权重按非商用许可发布。官方说明生成结果可用于个人、科研与商业用途，但具体条款以 LICENSE.md 原文为准；正式商用建议先确认授权。
params: 12B（BF16），常见 FP8 / GGUF 量化版本
hardware: 待补充（尚未记录本机实测数据）
pros:
  - 提示词遵循度高，长句描述不容易被忽略
  - 画面质感与光影稳定，商业静物、产品图成功率高
  - 生态成熟，ComfyUI 里 ControlNet、LoRA、放大流程都能直接用
cons:
  - 非商用许可证，商用需要单独评估或换授权版本
  - 12B 权重加载慢，显存占用不低
  - 文字渲染明显弱于专门做排版的模型
modelUrl: https://huggingface.co/black-forest-labs/FLUX.1-dev
codeUrl: https://github.com/black-forest-labs/flux
docsUrl: https://huggingface.co/docs/diffusers/main/en/api/pipelines/flux
status: published
tags:
  - 生图
  - 写实
  - 商业素材
relatedArticles: []
updated: 2026-10-16
---

## 能力与适用场景

FLUX.1 [dev] 是 Black Forest Labs 发布的 12B 文本到图像模型，采用整流流（Rectified Flow）Transformer 结构。它的强项是**听得懂话**：提示词里写了主体、材质、光线、镜头，画面基本会照着走。

适合：

- **产品与静物**：木料、织物、金属这类材质表现稳定，适合电商主图方向。
- **写实场景**：自然光的氛围还原度较高，不需要堆太多修饰词。
- **系列图**：同一段提示词改细节即可批量出图，风格漂移小。

不适合：

- **画面内文字**：需要精确排版文字时，换 Qwen-Image 这类模型更省力。
- **直接商用**：权重是非商用许可，商业项目需要先处理授权问题。

## 在 ComfyUI 中使用

1. 把 `flux1-dev.safetensors` 放入 `models/unet`（或 `models/diffusion_models`，取决于节点版本）。
2. 文本编码器需要 `clip_l` 与 `t5xxl`，VAE 用 `ae.safetensors`。
3. 采样器用 `euler` + `simple`，步数 20–28，guidance 3.5 左右是比较通用的起点。
4. 显存吃紧时优先换 FP8 权重，其次降分辨率再放大，不要一边降步数一边加 CFG。

## 许可证提示

这个模型的许可证是 **FLUX.1 [dev] Non-Commercial License**，Hugging Face 页面在下载前需要先同意协议。站内所有标为 FLUX.1 [dev] 的提示词只描述生成效果，不代表商用授权。
