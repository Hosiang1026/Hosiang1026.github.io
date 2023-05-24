---
title: 推荐系列-使用 PAI-Blade 优化 Stable Diffusion 推理流程
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 8
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: 38f3095f
date: 2023-05-24 09:23:09
---

&emsp;&emsp; AIGC是人工智能计算领域里发展迅速的重要业务。Stable Diffusion 是其中最热门的开源模型，受到广泛关注。然而，随着应用场景不断扩大，Stable Diffusion所面临的推理时延和计算成本问题...
<!-- more -->

                                                                                                                                                                                         
### 背景 
AIGC是人工智能计算领域里发展迅速的重要业务。Stable Diffusion 是其中最热门的开源模型���受到广泛关注。然而，随着应用场景不断扩大，Stable Diffusion所面临的推理时延和计算成本问题也越来越突出。 
 
### 简介 
PAI-Blade是 PAI 推出的通用推理优化工具，可以通过模型系统联合优化，使模型达到最优推理性能。PAI-Blade依托于完全动态尺寸的AI编译器BladeDISC 和 基于深度学习自动调度的高性能计算库BlaDNN， 为包括图像生成模型Stable Diffsuion, 大语言模型LLM, 大规模稀疏推荐模型CTR, 语音识别模型ASR等等在内的众多模型提供自动的高性能推理优化。 
BladeDISC 是一款支持完全动态尺寸的AI编译器，前端支持Pytorch和Tensorflow模型。对于Pytorch模型能够支持 TorchScript 和 TorchDynamo 两种输入模式，后端通过 AStitch 大尺度算子融合技术和高效的 codegen 逻辑提升模型访存密集算子的执行效率。BladeDISC现已在github开源，项目地址：https://github.com/alibaba/BladeDISC 。 
BlaDNN 是基于深度学习自动调度的高性能计算库。BlaDNN 作为Ansor的升级版，不仅生成的kernel性能超过Ansor，而且可以完全依赖DNN自动调度而不使用Tuning调优，使得Dynamic Shape业务场景的在线自动调度成为可能，基于DNN自动调度生成的GPU计算密集算子的平均性能达到极致tuning性能的99.39%，通过模型系统联合优化DNN推理延时低至2us, 并且只使用一个CPU Core，从而不会对GPU模型本身的性能造成任何抖动。 
通过采用 PAI-Blade 加速推理优化技术，对访存密集型算子进行大尺度融合及优化代码生成，对计算密集型算子进行自动调度，可以大幅度降低Stable Diffusion的推理延迟和显存占用，从而减少计算成本。使用 PAI-Blade 优化Stable Diffusion 具有以下三点优势： 
 
 高性能，使用Blade可以降低 Text2Img、Img2Img 等推理流程的端到端延迟 2.42-3.05 倍，同时可降低省显存占用至多 5.27 倍，超过TensorRT-8.5等业内SOTA优化手段。 
 完全动态shape支持，一次优化后，可以支持任意形状、batch size的输入。 
 易用性、可扩展性：仅需数行代码即可在多类pipeline中启用 Blade优化，同时能支持LoRA等推理方案的优化。 
 
 
### 使用示例 
本文接下来以社区流行的 "runwayml/stable-diffusion-v1-5" 的 Text2Img pipeline 为例，详细介绍 PAI-Blade 在各类使用场景下的使用方法。 
 
#### 环境安装 
下述示例完整的运行脚本及相关环境已集成到  
 ```java 
  registry.cn-beijing.aliyuncs.com/blade_demo/blade_diffusion
  ``` 
  docker 中。在该docker中，直接通过  
 ```java 
  python /blade/blade_diffusion.py
  ``` 
  即可运行推理示例。 
 
#### 官方模型优化 
使用 PAI-Blade 优化 Stable Diffusion 模型可以分为以下几个步骤。 
首先，加载预训练的模型。 
 
 ```java 
  from diffusers import StableDiffusionPipeline

device = torch.device("cuda:0")
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", revision="fp16", torch_dtype=torch.float16).to(device)

  ``` 
  
第二步，使用 PAI-Blade 进行优化。注意，由于 PAI-Blade 是完全动态shape的优化工具，优化完成后可使用任意shape进行推理。 
 
 ```java 
  import torch_blade

opt_cfg = torch_blade.Config()
opt_cfg.enable_fp16 = True
with opt_cfg, torch.no_grad():
    encoder = blade_optimize(pipe.text_encoder, model_inputs=encoder_inputs, allow_tracing=True)
    unet = blade_optimize(pipe.unet, model_inputs=unet_inputs, allow_tracing=True)
    decoder = blade_optimize(pipe.vae.decoder, model_inputs=decoder_inputs, allow_tracing=True)

  ``` 
  
最后，使用优化好的模型替换原始模型，后续即可以原始 pipeline 同样的方式进行推理。 
 
 ```java 
  @dataclass
class UNet2DConditionOutput:
    sample: torch.FloatTensor

class TracedUNet(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.config = pipe.unet.config
        self.in_channels = pipe.unet.in_channels
        self.device = pipe.unet.device

    def forward(self, latent_model_input, t, encoder_hidden_states, **kwargs):
        sample = unet(latent_model_input.half(), t.half(), encoder_hidden_states.half())["sample"]
        return UNet2DConditionOutput(sample=sample)

class TracedEncoder(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.config = pipe.text_encoder.config
        self.device = pipe.text_encoder.device
        self.dtype = torch.half

    def forward(self, input_ids, **kwargs):
        embeddings = encoder(input_ids.long())
        return [embeddings["last_hidden_state"]]

class TracedDecoder(torch.nn.Module):
    def forward(self, input):
        return decoder(input.half())

pipe.text_encoder = TracedEncoder()
pipe.unet = TracedUNet()
pipe.vae.decoder = TracedDecoder()

  ``` 
  
 
##### A100 性能对比 
 
  
   
   image size 
   samplesteps 
   Time of Pytorch(s) 
   Time of PAI-Blade(s) 
   speedup 
   Pytorch memory usage (GB) 
   PAI-Blade memory usage (GB) 
   
  
  
   
   1024x1024 
   50 
   13.26 
   4.34 
   3.06X 
   32.91 
   6.25 
   
   
   768x768 
   50 
   5.65 
   2.00 
   2.83X 
   14.99 
   5.91 
   
   
   512x512 
   50 
   2.24 
   0.84 
   2.67X 
   6.60 
   5.42 
   
  
 
 
##### A10 性能对比 
 
  
   
   image size 
   samplesteps 
   Time of Pytorch(s) 
   Time of PAI-Blade(s) 
   speedup 
   Pytorch memory usage (GB) 
   PAI-Blade memory usage (GB) 
   
  
  
   
   1024x1024 
   50 
   OOM 
   13.86 
   - 
   OOM 
   6.89 
   
   
   768x768 
   50 
   13.13 
   5.61 
   2.34X 
   12.60 
   6.22 
   
   
   512x512 
   50 
   4.53 
   2.11 
   2.15X 
   6.28 
   5.47 
   
  
 
 
##### 推理结果验证 
使用PAI-Blade优化后，生成的图像与Pytorch原始输出对比，观察优化结果是否正确。左图为Pytorch eager模式输出，右图为PAI-Blade优化后的模型输出。 
 
 
#### 已验证的pipeline类型 
 
 StableDiffusionPipeline 
 StableDiffusionImg2ImgPipeline 
 StableDiffusionInpaintPipeline 
 AltDiffusionPipeline 
 
 
#### LoRA优化 
LoRA 是指在原始模型基础上，添加额外的低秩矩阵来微调预训练的模型，并且只训练那些新添加的权重，从而大幅降低微调成本。可以通过 diffusers官方训练代码 微调得到 LoRA 权重。diffusers 加载使用 LoRA 后，模型运行方式与原始模型略有不同，带来额外计算开销。 
PAI-Blade 目前已适配 huggingface/diffusers 中 LoRA 优化方式。同样的，Blade 针对同一pipeline，只需优化一次，即可使用任意的 LoRA 权重进行推理。我们将在下一篇文章中介绍PAI-Blade 优化 LoRA 的使用方式，敬请期待。 
 
### 展望 
目前，Stable Diffusion相关技术仍在不断演化中，PAI-Blade 团队也时刻关注社区趋势，将优化适配到各种工具中去。目前团队主要集中在： 
 
 将相关优化集成到 stable-diffusion-webui 中； 
 优化 finetune 训练速度。 

                                        