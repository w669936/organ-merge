# 把《合成大器官》发布到 GitHub Pages

你只需要浏览器和交付的 `organ-merge-pages.zip`，无需写代码或安装开发工具。

## 1. 登录 GitHub

打开 [GitHub](https://github.com/)。已有账号点击 Sign in；没有账号点击 Sign up，按提示注册并完成邮箱验证。记住用户名，最后的网址会用到它。

## 2. 创建公开仓库

右上角“+”→ New repository。Repository name 填 `organ-merge`；选择 **Public**；打开 Add README，便于创建后直接上传。点击 Create repository。默认分支通常为 `main`。

## 3. 解压游戏发布包

在电脑上右键 `organ-merge-pages.zip` → 全部解压，打开解压后的文件夹。你应直接看到：

```text
index.html
style.css
config.js
physics.js
game.js
assets/
.nojekyll
README.md
```

根目录有 `index.html` 才正确。**不要上传 ZIP 本身，也不要把最外层解压文件夹整体作为一层目录上传。** 网站文件应直接位于仓库根目录。

Windows 若看不到 `.nojekyll`，在资源管理器“查看 → 显示”中开启隐藏的项目与文件扩展名；不要将其改名为 `.nojekyll.txt`。它已包含在发布包内。

## 4. 上传网站文件

在仓库 Code 页面，选择 Add file → Upload files。打开解压文件夹，全选**内部所有文件以及 assets 文件夹**，拖到 GitHub 的上传区。浏览器会保留 assets 内部目录；不要把其中图片单独拖到根目录。

检查列表同时有 `index.html`、`game.js` 与 `assets/01.webp` 等内容。写提交说明，例如“发布器官合成游戏”。选择提交到 `main`，点击 Commit changes（某些界面可能先显示 Propose changes，再确认提交）。等上传完成。游戏发布包文件数量小于网页单次上传的 100 个限制。

回到 Code 页面，确保能直接看到 `index.html` 和 `assets` 文件夹。若只看到一个外层文件夹，说明多套了一层，应将内部文件上传到根目录。

## 5. 开启 Pages

仓库上方 Settings → 左侧 Pages。找到 Build and deployment：

1. Source 选择 **Deploy from a branch**。
2. Branch 选择 **main**。
3. 右侧目录选择 **/(root)**。
4. 点击 Save。

不需要创建或编辑 GitHub Actions 文件，也不需要填写构建命令。GitHub 平台可能自动显示内部部署任务，这是正常的。

## 6. 找到游戏链接

等待部署完成，再刷新 Settings → Pages。出现 Visit site 后点击即可。通常地址为：

`https://你的用户名.github.io/organ-merge/`

注意包含仓库名 `/organ-merge/` 和末尾斜杠。发布更新有时需要几分钟；GitHub 官方说明可能最长约 10 分钟。若仍未发布，检查邮箱验证、公开仓库、部署任务状态及分支选择。

## 7. 用手机验证

把 Visit site 的链接发到自己的手机，或制作该链接的二维码。先用竖屏浏览器打开：

- 点击“开始研究”，按住棋盘拖动并松手，应只落下一枚器官。
- 器官接触会合成，顶部数字增加；“下一个”预览正常。
- 棋盘内拖动不应滚动页面；图鉴区域仍可正常浏览。
- 点击声音开关试听；现场人多时可保持关闭。
- 本局结束后窗口显示最终分数和称号，页面不会自动重开。

首次打开需要联网下载静态文件；游戏过程不请求服务器。不要把手机聊天软件里的 ZIP 预览当成正式网页入口。没有安装为离线应用的步骤，也没有后台服务。

## 8. 更新游戏

保留原来的仓库与链接。解压新版发布包，按第 4 步再次上传内部文件并提交，覆盖同名文件。资源、CSS 与 JS 应一起上传。部署完成后手机刷新网页；若仍看到旧版，关闭旧标签重新打开，或清除该站网页缓存。正在进行的一局会在刷新后清空。

## 9. 常见问题

| 现象 | 检查方法 |
|---|---|
| 整个网页 404 | 确认 Visit site 链接含 `/organ-merge/`，Pages 使用 main 和 /(root)，仓库根目录有小写 index.html，等待部署完成。 |
| 只有 README，没有游戏 | 检查 index.html 是否被放进额外的外层文件夹；将网站内部文件上传到仓库根目录。 |
| 图片不显示或无法开始 | assets 文件夹必须完整保留；文件名大小写和两位编号不能修改；检查 01.webp 到 11.webp 与 colliders.js。 |
| 没有样式 | style.css 没有上传，或位于错误层级。 |
| 声音没有响 | 默认关闭；点击开关才初始化音频，还需检查设备媒体音量与浏览器限制。 |
| 找不到 main | 先完成上传并提交；以仓库实际分支名为准选择发布源。 |
| 没有 Pages 选项或无法发布 | 确认你有仓库管理权限，仓库为 Public，账号邮箱已验证；组织策略也可能限制 Pages。 |
| 重新打开没有历史分数 | 这是设计要求。游戏仅保留当前局，兑奖请在点击再玩一次之前展示。 |

本教程按 2026-10-17 查阅的官方说明编写。界面名称可能随 GitHub 调整；若看到相近名称，以分支发布、根目录、静态入口这三个要点为准。

官方参考：[创建 Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[上传文件](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。
