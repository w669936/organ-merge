# 素材与来源

本交付的 SVG 路径、配色、面部表情、网页布局、游戏源码和 WebAudio 音效为本次任务独立制作。可以用于本项目及医学社团活动中的展示、修改、复制与发布。没有引入第三方运行库、远程字体、音乐或图片。

11 个编号按 config.js 顺序对应器官。SVG 为可编辑源图；768px PNG 为高分辨率透明源图；WebP 为网页使用的透明优化图。PNG 与 WebP 来自相同 SVG 构图。碰撞形状来自 PNG 的 Alpha，不是手填圆形轮廓。

仅在维护工具中使用 Pillow、NumPy、Sharp 和 Playwright；它们不随游戏发布包分发，也不是游戏运行条件。若重新安装维护环境，请遵守这些工具各自的许可证。

玩法与物理技术原理研究来源：

- https://github.com/YHSome/BigNaiWa （2026-10-17 阅读公开 README）
- https://yhsome.github.io/BigNaiWa/ （可读取跳转页）
- https://milkyfrog.com/hecheng （当次访问工具无法读取）

未下载或复制参考项目的源码、角色贴图、音频、排行榜脚本。实现同级接触合成、组合圆、固定步长及稳定超线失败等通用原理。参考参数经过独立校准。
