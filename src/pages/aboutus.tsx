import { Group } from '@mantine/core';
export default function Aboutus() {
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>什么是Stable Diffusion?</h1>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px', textAlign:'center'}}>
        <text style={{ textAlign: 'center' }}>
          Stable Diffusion（简称SD）由Stability AI，Runway和LMU-CompVis（慕尼黑大学计算机视觉与学习研究组，前身是海德堡大学的计算机视觉组）领导，
          以CVPR'22的Latent Diffusion Model工作为基础，结合了Eleuther AI、LAION提供的开源数据资源，于2022年8月根据CreativeML Open RAIL-M开源协议发布。
          SD是一种潜空间扩散模型（Latent Diffusion Model），能够从文本描述中生成详细的图像。和Midjourney相比，Stable Diffusion 最大的优势是其开源性以及可操作性，
          开发者社群以此为基础开发了大量fine-tune技术与模型（如Dreambooth, lora, Textual Inversion, LyCORIS...） ，ContorlNet，WebUI，模型训练器，整合包等等，
          并且在持续维护更新。
        </text>
      </div>
      <h1 style={{ textAlign: 'center' }}>什么是Civitai（简称C站）？</h1>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px' }}>
        <text style={{ textAlign: 'center' }}>
          Civitai是一个Stable Diffusion模型和生成作品的分享平台，人们基于SD的开源技术发布自己训练的模型和生成作品，
          也可以浏览和下载其他用户的内容，方便人们分享和发现创造人工智能艺术所需的资源。这些模型可以与各类人工智能艺术软件配合使用，生成独特的作品。
        </text>
      </div>
      <h1 style={{ textAlign: 'center' }}>挺不错的，下载模型后我该怎么使用它们呢？</h1>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px' }}>
        <text style={{ textAlign: 'center' }}>
          Stable Diffusion技术日新月异，我们建议您加入我们的开源社区，QQ频道，以及访问专栏，那里会有很多优秀的创作者的入门文章和使用技巧。
          以及B站有很多成熟的入门教程，我们后续也会经过精选后转载到文章区域。
        </text>
      </div>
      <h1 style={{ textAlign: 'center' }}>那么，mikomiko是什么？</h1>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px' }}>
        <text style={{ textAlign: 'center' }}>
          mikomiko, 由MikoWorld开源团队维护，我们致力于C站的本地化与合规使用。我们将依据CreativeML Open RAIL-M协议，
          持续追踪最新的Stable Diffusion等开源AI技术，模型与作品，为使用者提供便利，所以在这里总有新东西可以探索。无论您是经验丰富的AI艺术家还是刚刚入门，
          我们邀请您浏览我们的模型选择，看看您能创作出什么。如果您尝试了某个模型，我们鼓励您留下评论并与社区的其他人分享您的体验。我们共同构建一个充满活力和支持的AI艺术家社区。
        </text>
      </div>
      <h3 style={{ textAlign: 'center' }}>点击图片，教你使用mikomiko</h3>

      <h1 style={{ textAlign: 'center' }}>什么是MikoWorld?</h1>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px' }}>
        <text style={{ textAlign: 'center' }}>
          MikoWorld团队与任何爱好开源AI技术的团队一样，对人工智能技术的发展感到兴奋与激动，随着多模态人工智能模型被广泛的传播与使用，
          我们看到其有潜力在未来改变每个人学习，创作与思考的方式，并使众人从中获益。同时，我们也对其潜在被滥用的风险表示担忧，无论是由于其技术限制还是伦理考虑。
          我们的愿景是推动一个包容性，可持续并负责任的人工智能生态，旨在促进人工智能技术的开放和负责任的下游使用。
          “For the people, by the people.”
        </text>
      </div>
      <h3 style={{ textAlign: 'center' }}>点击图片，进入MikoWorld Github</h3>
      <div style={{ width: '700px', marginLeft: '800px', marginBottom: '100px' }}>
        <img
          style={{ width: '500px', height: '300px' }}
          src='https://img2.baidu.com/it/u=28727727,426686622&fm=253&fmt=auto&app=138&f=JPEG?w=1174&h=500'>
        </img>
      </div>
      <h3 style={{ textAlign: 'center' }}>MikoWorld Github</h3>
      <div style={{ width: '700px', marginLeft: '505px', marginBottom: '100px' }}>
       <text style={{ textAlign: 'center' }}>
        我们的愿景是推动一个包容性，可持续并负责任的人工智能生态，旨在促进人工智能技术的开放和负责任的下游使用。
       </text>
      </div>
      <h1 style={{ textAlign: 'center' }}>我们团队</h1>
      <div style={{ width: '700px', marginLeft: '600px', marginBottom: '100px' }}>
        <img
          style={{ width: '500px', height: '300px' }}
          src='https://img1.baidu.com/it/u=3552789230,3926044278&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500'>
        </img>
      </div>
    </>
  )

}