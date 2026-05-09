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
- 🕒 记录时间、提交信息、文件名、内容和内容哈希
- 🧭 文件改名后历史不会丢，会额外记录“重命名”快照
- 📁 每个文件通过稳定索引关联历史，默认存储在 `.versions`
- 🧮 可配置每个文件最多保留多少个版本，默认 50
- 🟢🔴 GitHub 风格差异对比，支持左右、行内、上下文件三种布局
- ↩️ 可以恢复到任意历史版本
- 🛟 恢复操作本身也会创建新快照，方便再次回退
- ⚙️ 可选保存时自动创建快照，并用简短摘要描述“修改内容 / 重命名”等变化
- 🔢 显示笔记字数、行数和版本增删统计
- 🪟 左侧 ribbon 按钮打开浮动历史窗口，命令面板仍可打开右侧栏
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
2. 点击左侧 ribbon 图标打开浮动历史窗口，或者从命令面板运行“打开版本控制面板”打开右侧栏。
3. 点击“创建快照”，输入这次修改的提交信息。
4. 在紧凑时间线中选择一个版本，查看文件名、字数、哈希、增删统计和差异。
5. 在差异区域选择左右对比、行内对比或上下文件对比。
6. 如果需要回到旧版本，点击“恢复”并确认。

小建议：如果你喜欢“重要节点手动保存”的工作流，建议关闭自动快照；如果你喜欢“每次保存都留痕”，可以打开自动快照。

## 设置项 ⚙️

| 设置 | 说明 |
| --- | --- |
| Language | 自动、English、简体中文 |
| Version storage folder | 版本 JSON 文件存储位置，默认 `.versions` |
| Auto snapshot on save | Markdown 文件变化时自动创建快照 |
| Maximum versions per file | 每个文件最多保留多少个版本，默认 50 |
| Diff layout | 默认差异布局：左右对比、行内对比、上下文件 |

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
      "filePath": "path/to/file.md",
      "fileName": "file.md",
      "changeType": "auto",
      "additions": 8,
      "deletions": 2,
      "wordCount": 120,
      "charCount": 420
    }
  ],
  "currentHash": "sha256..."
}
```

插件会维护 `.versions/index.json`，把笔记路径映射到稳定的历史文件。笔记改名时，旧路径会迁移到新路径，历史不会因为文件名变化而丢失。

重命名会产生一条独立快照，例如：

```text
重命名：Old name.md -> New name.md
```

内容修改会产生更短的自动摘要，例如：

```text
修改内容：新增 8 行，删除 2 行 · Project Plan
```

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
3. 滚动到 JSON 数组最末尾。
4. 找到当前最后一个插件条目。
5. 在当前最后一个插件条目的 `}` 后面加一个逗号。
6. 把你的插件信息放在它后面，作为新的最后一项。
7. 确认你的条目后面没有多余逗号，因为 JSON 数组最后一项后面不能有逗号。

非常重要：新增条目必须放在整个 `community-plugins.json` 的最后。如果 bot 提示：

```text
The last plugin in the list is: santiyounger/wpm-reading-time.
```

那就说明官方当前列表最后一项是 `santiyounger/wpm-reading-time`，你的条目应该放在它后面，而不是插在中间或按字母顺序插入。

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

7. PR 描述必须使用官方 `Community Plugin` 模板。
8. 按模板填写说明，并把已完成项目勾选成 `[x]`。
9. 点击 `Create pull request`。

可以直接复制下面这份模板，再按你的实际测试情况调整：

```markdown
# I am submitting a new Community Plugin

- [x] I attest that I have done my best to deliver a high-quality plugin, am proud of the code I have written, and would recommend it to others. I commit to maintaining the plugin and being responsive to bug reports. If I am no longer able to maintain it, I will make reasonable efforts to find a successor maintainer or withdraw the plugin from the directory.

## Repo URL

Link to my plugin:
https://github.com/Hawaiine/oasisic-note-version-control

## Release Checklist
- [x] I have tested the plugin on
  - [x]  Windows
  - [ ]  macOS
  - [ ]  Linux
  - [ ]  Android _(if applicable)_
  - [ ]  iOS _(if applicable)_
- [x] My GitHub release contains all required files (as individual files, not just in the source.zip / source.tar.gz)
  - [x] `main.js`
  - [x] `manifest.json`
  - [x] `styles.css` _(optional)_
- [x] GitHub release name matches the exact version number specified in my manifest.json (_**Note:** Use the exact version number, don't include a prefix `v`_)
- [x] The `id` in my `manifest.json` matches the `id` in the `community-plugins.json` file.
- [x] My README.md describes the plugin's purpose and provides clear usage instructions.
- [x] I have read the developer policies at https://docs.obsidian.md/Developer+policies, and have assessed my plugin's adherence to these policies.
- [x] I have read the tips in https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines and have self-reviewed my plugin to avoid these common pitfalls.
- [x] I have added a license in the LICENSE file.
- [x] My project respects and is compatible with the original license of any code from other plugins that I'm using.
      I have given proper attribution to these other projects in my `README.md`.
```

如果你还没有测试 macOS / Linux / 移动端，不要随便勾选。只勾选你实际测试过的平台。已经确认 Release 附件存在、README 清楚、LICENSE 存在的项目可以勾选。

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

可以用上面“创建 PR”一节里的模板。注意不要只写一句“Add plugin”，bot 会认为没有遵循模板。

### 新增条目不在列表末尾

报错类似：

```text
❌ The newly added entry is not at the end, or you are submitting on someone else's behalf. The last plugin in the list is: santiyounger/wpm-reading-time.
```

处理方式：

1. 打开你的 PR。
2. 点击 `Files changed`。
3. 找到 `community-plugins.json`。
4. 确认你的插件条目是不是整个 JSON 数组的最后一项。
5. 如果不是，点击右上角 `...`，选择 `Edit file`。
6. 剪切你的插件条目。
7. 滚动到文件最底部。
8. 找到 bot 提到的当前最后一个插件，例如：

   ```json
   {
     "id": "wpm-reading-time",
     "name": "...",
     "author": "...",
     "description": "...",
     "repo": "santiyounger/wpm-reading-time"
   }
   ```

9. 在这个最后条目的 `}` 后面加逗号。
10. 把你的插件条目粘贴到它后面。
11. 确认你的插件条目是数组最后一个元素，后面只剩下结束的 `]`。
12. 确认你的插件条目最后没有逗号。
13. 提交修改到同一个 PR 分支。

如果你是用 GitHub 组织账号提交，还要确认你是该组织的 public member。否则 bot 可能认为你是在替别人提交插件。你的情况如果仓库是 `Hawaiine/oasisic-note-version-control`，最好用 `Hawaiine` 这个账号提交 PR。

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

1. 修改代码和 README。
2. 更新 `manifest.json` 里的 `version`，例如从 `0.1.0` 改成 `0.1.1`。
3. 如果最低 Obsidian 版本没变，`versions.json` 可以不动；如果变了，就补上新版本映射：

   ```json
   {
     "0.1.0": "0.15.0",
     "0.1.1": "1.5.0"
   }
   ```

4. 把改动 push 到 GitHub。
5. 创建同版本号 tag，例如：

   ```bash
   git tag 0.1.1
   git push origin 0.1.1
   ```

6. 等 GitHub Actions 自动构建并生成 Release。
7. 打开 `Releases -> 0.1.1 -> Assets`，确认有：

   ```text
   manifest.json
   main.js
   styles.css
   ```

8. 如果发现问题，修代码后删除错误的 tag / Release，再重新创建同版本 tag，或者把版本号递增到下一个补丁版本。

Obsidian 会从你的 GitHub Release 读取新版本，不需要再次向 `obsidian-releases` 提 PR。

一个简单原则：`manifest.json` 的 `version`、Git tag、GitHub Release 名称三者保持完全一致，不加 `v` 前缀。

## English Quick Start 🌐

Oasisic Note Version Control creates Git-style snapshots for Obsidian Markdown files. It keeps history after note renames, tracks content changes separately from file-name changes, and offers GitHub-style diff layouts.

- Open a Markdown note.
- Click the ribbon icon for a floating history window, or run `Open version control panel` for the right sidebar.
- Click `Snapshot` to save a version.
- Select a timeline item to inspect metadata, diff, and preview.
- Switch between side-by-side, inline, and top/bottom diff layouts.
- Click `Revert` to restore an older version after confirmation.

The plugin supports `Auto`, `English`, and `Simplified Chinese` as interface language options.
