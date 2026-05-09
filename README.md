# Oasisic Note Version Control 🌿

给 Obsidian Markdown 笔记准备的轻量版本控制插件。它像一个温和版 Git：帮你给笔记打快照、看历史、比较差异，也能把内容恢复到某个旧版本。

Built for Obsidian Markdown notes, with Git-style snapshots, timeline history, line-level diffs, and one-click restore. The interface supports Simplified Chinese and English.

## 为什么会需要它？✨

写作和整理知识库时，我们常常会遇到这些小场景：

- 改了一大段内容，后来发现旧版本更好。
- 写论文、文章、项目文档时，想保留每个关键节点。
- 不小心删掉一段内容，希望能从历史里找回来。
- 想知道这篇笔记最近到底改了什么。

Oasisic Note Version Control 就是为这些时刻准备的。它不会把你的笔记工作流变复杂，只是在你需要回头看时，安静地把版本历史放在那里。

## 功能亮点 🚀

- 📝 为任意 Markdown 文件创建手动快照
- 🔖 使用短 SHA-256 哈希作为版本 ID
- 🕒 记录时间、提交信息、作者、内容和内容哈希
- 📁 每个文件独立保存 JSON 历史，默认位于 `.versions`
- 🧮 可配置每个文件最多保留多少个版本，默认 50
- 🟢🔴 支持行级差异对比，清楚标记新增和删除
- ↩️ 可以恢复到任意历史版本
- 🛟 恢复操作本身也会创建新快照，方便再次回退
- ⚙️ 可选保存时自动创建快照
- 🌓 自动适配 Obsidian 亮色 / 深色主题
- 🌏 支持自动语言、English、简体中文

## 项目结构 📁

这个仓库按比较常见的 Obsidian 插件结构整理：

```text
.
├── .github/
│   └── workflows/
│       └── release.yml
├── src/
│   ├── main.ts
│   └── types.ts
├── .gitignore
├── LICENSE
├── README.md
├── esbuild.config.mjs
├── manifest.json
├── package.json
├── styles.css
├── tsconfig.json
└── versions.json
```

说明一下各自的角色：

- `src/main.ts`：插件主体，包括版本控制逻辑、视图、设置页和命令注册。
- `src/types.ts`：版本数据结构和 diff 类型。
- `styles.css`：插件 UI 样式，会随插件一起发布。
- `manifest.json`：Obsidian 读取插件身份、版本、最低兼容版本。
- `versions.json`：告诉 Obsidian 每个插件版本兼容的最低 Obsidian 版本。
- `.github/workflows/release.yml`：GitHub 自动构建并发布 Release 附件。
- `LICENSE`：开源许可证，目前使用 MIT License。

## 开发安装 🛠️

把项目放到你的 Obsidian vault 插件目录：

```text
<vault>/.obsidian/plugins/oasisic-note-version-control/
```

如果你本地有 npm，可以运行：

```bash
npm install
npm run build
```

然后在 Obsidian 里打开：

```text
Settings -> Community plugins -> Oasisic Note Version Control
```

如果你本地没有 npm，也没关系，后面可以让 GitHub Actions 自动构建 `main.js`。

## 使用方式 📌

1. 打开一篇 Markdown 笔记。
2. 从命令面板运行“打开版本控制面板”，或点击左侧 ribbon 图标。
3. 点击“创建快照”，输入这次修改的提交信息。
4. 在时间线中选择一个版本，查看详情和差异。
5. 如果需要回到旧版本，点击“恢复”并确认。

小建议：如果你喜欢“重要节点手动保存”的工作流，建议关闭自动快照；如果你喜欢“每次保存都留痕”，可以打开自动快照。

## 设置项 ⚙️

| 设置 | 说明 |
| --- | --- |
| Language | 自动、English、简体中文 |
| Version storage folder | 版本 JSON 文件存储位置，默认 `.versions` |
| Auto snapshot on save | Markdown 文件变化时自动创建快照 |
| Maximum versions per file | 每个文件最多保留多少个版本，默认 50 |
| Author | 写入每个快照的作者名称 |

## 数据存储格式 💾

历史会保存在 vault 内部的 JSON 文件中：

```json
{
  "filePath": "path/to/file.md",
  "versions": [
    {
      "id": "a1b2c3d4",
      "timestamp": 1683691200000,
      "message": "Update section on features",
      "content": "file content...",
      "hash": "sha256...",
      "author": "User"
    }
  ],
  "currentHash": "sha256..."
}
```

插件会在历史文件名中加入笔记路径的短哈希，避免不同文件夹下同名笔记发生冲突。

## 发布到 GitHub Release 🏷️

Obsidian 社区插件市场安装插件时，会从你的 GitHub Release 下载这三个文件：

```text
manifest.json
main.js
styles.css
```

所以每次发布版本时，Release 附件里必须有它们。

### 方式 A：本地构建

如果你本地有 npm：

```bash
npm install
npm run build
```

然后创建 GitHub Release。Release tag 必须和 `manifest.json` 里的 `version` 完全一致，例如：

```text
0.1.0
```

不要写成：

```text
v0.1.0
```

### 方式 B：让 GitHub 自动构建

如果你本地没有 npm，可以用仓库里的 GitHub Actions。

推荐方式是推送一个 tag：

```bash
git tag 0.1.0
git push origin 0.1.0
```

GitHub 会自动运行 `.github/workflows/release.yml`，完成这些事：

```text
npm install
npm run build
生成 main.js
创建或更新 0.1.0 Release
上传 manifest.json、main.js、styles.css
```

如果你本地连 git 命令也不方便用，可以用 GitHub 网页：

1. 打开你的插件仓库。
2. 进入 `Actions` 页面。
3. 选择 `Release Obsidian Plugin`。
4. 点击 `Run workflow`。
5. 在 `version` 里填写和 `manifest.json` 完全一致的版本号，例如 `0.1.0`。

不过更推荐用 tag 触发，因为 tag、`manifest.json` 版本和 Release 会自然对应。

## 提交到 Obsidian 插件市场 🌍

如果你想让它像正常社区插件一样出现在 Obsidian 插件市场，需要向官方仓库提交一次 PR。

官方仓库：

```text
https://github.com/obsidianmd/obsidian-releases
```

首次通过审核后，后续新版本只需要在你自己的插件仓库发 GitHub Release，不需要每次都向 `obsidian-releases` 提 PR。

### 1. 准备自己的公开仓库

例如：

```text
https://github.com/Hawaiine/oasisic-note-version-control
```

确保仓库根目录至少有：

```text
manifest.json
versions.json
README.md
LICENSE
styles.css
package.json
src/
.github/workflows/release.yml
```

也要确认 `manifest.json` 里的信息是最新的：

```json
{
  "id": "oasisic-note-version-control",
  "name": "Oasisic Note Version Control",
  "version": "0.1.0",
  "minAppVersion": "0.15.0",
  "author": "Hawaiine"
}
```

### 2. 确认 Release 附件

进入你的 GitHub Release 页面，确认 `0.1.0` Release 里有：

```text
manifest.json
main.js
styles.css
```

特别注意：`main.js` 必须是 Release 附件。只把源码放在仓库里是不够的。

### 3. 修改 `community-plugins.json`

打开 `obsidianmd/obsidian-releases` 仓库里的 `community-plugins.json`。

你可以直接在 GitHub 网页操作：

1. 点击文件右上角的编辑按钮。
2. GitHub 会自动 fork 官方仓库到你的账号下。
3. 滚动到 JSON 数组末尾。
4. 在最后一个插件条目后面加逗号。
5. 添加你的插件信息。

推荐条目：

```json
{
  "id": "oasisic-note-version-control",
  "name": "Oasisic Note Version Control",
  "author": "Hawaiine",
  "description": "Git-style snapshots, history, diffs, and restore workflows for Markdown notes.",
  "repo": "Hawaiine/oasisic-note-version-control"
}
```

字段说明：

- `id`：必须和 `manifest.json` 里的 `id` 完全一致。
- `name`：插件市场里显示的名称。
- `author`：作者名，这里是 `Hawaiine`。
- `description`：一句话说明插件做什么，会用于搜索。
- `repo`：GitHub 仓库路径，不要带 `https://github.com/`。

### 4. 创建 PR

提交修改时：

1. 点击 `Commit changes...`。
2. 选择 `Propose changes`。
3. 点击 `Create pull request`。
4. 进入 PR 页面后，先切到 `Preview`。
5. 选择 `Community Plugin` 模板。
6. PR 标题建议写：

   ```text
   Add plugin: Oasisic Note Version Control
   ```

7. 按模板填写说明，并把已完成项目勾选成 `[x]`。
8. 点击 `Create pull request`。

### 5. 等待自动校验和人工审核

提交 PR 后，Obsidian 的 bot 会先做自动检查。

常见状态：

- `Ready for review`：自动校验通过，可以等待人工审核。
- `Validation failed`：自动校验失败，需要根据 bot 留言修复问题。
- `Changes requested`：审核者要求修改。
- `Additional review required`：还需要进一步审核。

如果 GitHub 提示你的 PR 和主分支有冲突，官方文档建议先不要自己 merge 或 rebase。等插件通过审核后，Obsidian 团队会在发布前处理冲突。

## 常见审核报错 🧯

### 没有按 PR 模板填写

报错类似：

```text
❌ You did not follow the pull request template.
```

处理方式：

1. 打开你的 PR。
2. 点击右上角 `Edit`。
3. 打开官方模板文件：

   ```text
   https://github.com/obsidianmd/obsidian-releases/blob/master/.github/PULL_REQUEST_TEMPLATE/plugin.md
   ```

4. 复制模板内容到你的 PR 描述里。
5. 按模板逐项填写插件信息。
6. 把已经完成的检查项从 `[ ]` 改成 `[x]`。
7. 点击 `Update comment` 保存。
8. 回到 PR 页面，确认描述里能看到完整模板，而不是只有一句简单说明。

### Release 缺少 `main.js`

报错类似：

```text
❌ The release 0.1.0 specified in the manifest.json in the root of the repo is missing the main.js file.
```

处理方式：

如果你没有本地 npm 环境，推荐直接用 GitHub Actions 修复：

1. 确认你的插件仓库里已经有这个文件：

   ```text
   .github/workflows/release.yml
   ```

2. 确认 `manifest.json` 里的版本号是当前要发布的版本，例如：

   ```json
   {
     "version": "0.1.0"
   }
   ```

3. 打开你的插件仓库，例如：

   ```text
   https://github.com/Hawaiine/oasisic-note-version-control
   ```

4. 点击仓库顶部的 `Actions`。
5. 左侧选择 `Release Obsidian Plugin`。
6. 点击右侧的 `Run workflow`。
7. 在 `version` 输入框里填写：

   ```text
   0.1.0
   ```

8. 点击绿色的 `Run workflow` 按钮。
9. 等待 workflow 跑完，状态应该变成绿色对勾。
10. 打开仓库右侧或顶部的 `Releases`。
11. 进入 `0.1.0` 这个 Release。
12. 检查 `Assets` 附件里是否有这三个文件：

    ```text
    manifest.json
    main.js
    styles.css
    ```

13. 如果能看到 `main.js`，这个报错就修好了。
14. 回到 Obsidian 插件提交 PR，留言说明你已经重新生成并上传 Release 附件。

如果你更习惯用 tag 触发，也可以这样做：

```bash
git tag 0.1.0
git push origin 0.1.0
```

注意：`main.js` 必须出现在 GitHub Release 的 `Assets` 附件里。只把 `main.js` 放在仓库根目录，Obsidian 的校验仍然可能认为缺失。

### 仓库缺少 LICENSE

报错类似：

```text
❌ Your repository does not include a license.
```

处理方式：

1. 打开你的插件仓库。
2. 确认仓库根目录有 `LICENSE` 文件。
3. 如果没有，点击 GitHub 网页里的 `Add file`。
4. 选择 `Create new file`。
5. 文件名填写：

   ```text
   LICENSE
   ```

6. 粘贴 MIT License 内容，或者使用 GitHub 提供的 license picker。
7. 提交到默认分支。
8. 回到仓库根目录，确认 `LICENSE` 和 `README.md`、`manifest.json` 在同一级。

当前项目已经使用 MIT License。

修完后，可以在 PR 里回复：

```text
Thanks for the check. I updated the PR template, added LICENSE, and uploaded main.js to the 0.1.0 release.
```

## 后续发新版本 🎉

审核通过后，之后发新版本只需要维护自己的插件仓库。

流程：

1. 更新 `manifest.json` 里的 `version`。
2. 必要时更新 `versions.json`。
3. 创建同版本号的 tag，例如 `0.1.1`。
4. 让 GitHub Actions 自动构建并上传 Release 附件。

Obsidian 会从你的 GitHub Release 读取新版本，不需要再次向 `obsidian-releases` 提 PR。

## English Quick Start 🌐

Oasisic Note Version Control creates Git-style snapshots for Obsidian Markdown files.

- Open a Markdown note.
- Run `Open version control panel`.
- Click `Snapshot` to save a version.
- Select a timeline item to inspect metadata, diff, and preview.
- Click `Revert` to restore an older version after confirmation.

The plugin supports `Auto`, `English`, and `Simplified Chinese` as interface language options.
