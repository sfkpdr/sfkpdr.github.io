---
name: Qwen-Image
slug: qwen-image
developer: 通义千问团队（阿里巴巴）
summary: 20B 规模的开源图像生成基础模型，最大特点是中文与英文文字渲染准确，图像编辑能力强。
tasks:
  - text-to-image
  - poster
  - character
runtimes:
  - ComfyUI
  - Diffusers
license: Apache-2.0
licenseName: Apache License 2.0
licenseNote: 权重与代码均为 Apache-2.0，允许商用。实际商用前请阅读官方仓库的 LICENSE 与使用条款原文。
params: 20B（BF16 官方权重），社区另有 FP8 / GGUF 量化版本
hardware: 待补充（尚未跑满血版本，不写猜测数据）
pros:
  - 中英文文字渲染效果在开源模型里属于第一梯队，做海报、封面很省事
  - 支持图像编辑（增删物体、改文字、风格迁移），不必再单独搭一套编辑流程
  - Apache-2.0 授权，商用限制少
cons:
  - 20B 参数量对显存要求高，消费级显卡基本要走量化
  - 中文提示词可用，但复杂画面用英文描述更稳定
  - 官方主要提供 Diffusers 用法，ComfyUI 需要装对应节点
modelUrl: https://huggingface.co/Qwen/Qwen-Image
codeUrl: https://github.com/QwenLM/Qwen-Image
docsUrl: https://qwenlm.github.io/blog/qwen-image/
status: published
tags:
  - 生图
  - 文字渲染
  - 图像编辑
relatedArticles:
  - comfyui-first-workflow
updated: 2026-10-18
---

## 能力与适用场景

Qwen-Image 是 Qwen 系列的图像生成基础模型，官方重点强调的是两件事：**复杂文本渲染**与**精确图像编辑**。

- **海报 / 封面 / 电商图**：画面里需要出现中文标题时，它比多数开源模型更少出现乱码字。
- **图像编辑**：物体插入与移除、局部改字、姿态调整，都能用同一套权重完成。
- **多比例出图**：官方提供 1:1、16:9、9:16、4:3、3:4、3:2、2:3 等推荐分辨率，直接按推荐值出图质量最稳。

## 部署方式

官方给的是 Diffusers 用法，需要较新的 diffusers 版本：

```bash
pip install git+https://github.com/huggingface/diffusers
```

```python
import torch
from diffusers import DiffusionPipeline

pipe = DiffusionPipeline.from_pretrained("Qwen/Qwen-Image", torch_dtype=torch.bfloat16)
pipe = pipe.to("cuda")

image = pipe(
    prompt="a linen curtain, warm afternoon light, 35mm photo",
    num_inference_steps=50,
    true_cfg_scale=4.0,
    width=1328,
    height=1328,
).images[0]
image.save("out.png")
```

在 ComfyUI 里使用需要安装支持 Qwen-Image 的节点包，或者等待官方/社区的原生支持更新。**首次加载 20B 权重对显存压力较大，建议先用 FP8 量化版本验证流程，再决定是否上全量。**

## 使用建议

- 官方推荐 `num_inference_steps=50`、`true_cfg_scale=4.0`，偏离太多容易出现画面发灰或过锐。
- 需要画面文字时，把要出现的文字用引号写在提示词里，并单独说明字体风格与排版位置。
- 站内的 Qwen-Image 提示词都会标明是否实测；未实测的条目不要直接当参数参考。
