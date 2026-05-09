import {
  App,
  ItemView,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  WorkspaceLeaf,
  moment,
  normalizePath
} from "obsidian";
import type { DiffLine, FileHistory, Version } from "./types";

const PLUGIN_NAME = "Oasisic Note Version Control";
const VIEW_TYPE_VERSION_CONTROL = "oasisic-note-version-control-view";

type LanguageSetting = "auto" | "en" | "zh-CN";

interface VersionControlSettings {
  versionDir: string;
  autoCommitOnSave: boolean;
  maxVersions: number;
  author: string;
  language: LanguageSetting;
}

const DEFAULT_SETTINGS: VersionControlSettings = {
  versionDir: ".versions",
  autoCommitOnSave: false,
  maxVersions: 50,
  author: "User",
  language: "auto"
};

const TRANSLATIONS = {
  en: {
    onlyMarkdown: "Only Markdown files can be versioned.",
    noChanges: "No changes to commit.",
    manualSnapshot: "Manual snapshot",
    autoSnapshot: "Auto snapshot: {{name}}",
    loadHistoryFailed: "Could not load version history for {{name}}.",
    versionNotFound: "Version not found.",
    beforeRevert: "Before reverting to {{id}}",
    revertMessage: "Revert to {{id}}: {{message}}",
    confirmRevertTitle: "Revert this note?",
    confirmRevertBody: "This will restore version {{id}} and create a new snapshot for the revert.",
    cancel: "Cancel",
    revert: "Revert",
    reverting: "Reverting...",
    viewTitle: "Version Control",
    noMarkdownTitle: "No Markdown file selected",
    noMarkdownBody: "Open a note to view or create version snapshots.",
    currentNote: "Current note",
    snapshot: "Snapshot",
    commitMessage: "Commit message",
    createdSnapshot: "Created snapshot {{id}}.",
    timeline: "Timeline",
    newestFirst: "Newest first",
    noSnapshots: "No snapshots yet",
    noSnapshotsBody: "Create the first snapshot to start tracking this note.",
    view: "View",
    details: "Details",
    selectSnapshot: "Select a snapshot to inspect its metadata and diff.",
    message: "Message",
    created: "Created",
    author: "Author",
    unknown: "Unknown",
    hash: "Hash",
    diffTitle: "Diff against current file",
    showingLines: "Showing first {{shown}} of {{total}} lines",
    noDifferences: "No differences.",
    preview: "Content preview",
    snapshotBody: "Snapshot body",
    emptyFile: "(empty file)",
    restored: "Restored {{id}}.",
    ribbon: "Open version control",
    commandOpen: "Open version control panel",
    commandSnapshot: "Create version snapshot for current note",
    autoSnapshotFailed: "Auto snapshot failed. Check the developer console for details.",
    openFailed: "Could not open version control view.",
    snapshotFailed: "Snapshot failed. Check the developer console for details.",
    settingsTitle: PLUGIN_NAME,
    storageFolder: "Version storage folder",
    storageFolderDesc: "Folder inside the vault where history JSON files are stored.",
    autoOnSave: "Auto snapshot on save",
    autoOnSaveDesc: "Create a version automatically when a Markdown file changes.",
    maxVersions: "Maximum versions per file",
    maxVersionsDesc: "Old snapshots are trimmed after this limit.",
    authorDesc: "Name stored with each snapshot.",
    language: "Language",
    languageDesc: "Choose the plugin interface language.",
    languageAuto: "Auto",
    languageEnglish: "English",
    languageChinese: "简体中文"
  },
  "zh-CN": {
    onlyMarkdown: "只能为 Markdown 文件创建版本。",
    noChanges: "没有可提交的变更。",
    manualSnapshot: "手动快照",
    autoSnapshot: "自动快照：{{name}}",
    loadHistoryFailed: "无法加载 {{name}} 的版本历史。",
    versionNotFound: "未找到该版本。",
    beforeRevert: "恢复到 {{id}} 前的快照",
    revertMessage: "恢复到 {{id}}：{{message}}",
    confirmRevertTitle: "要恢复这篇笔记吗？",
    confirmRevertBody: "这会恢复版本 {{id}}，并为本次恢复操作创建一个新的快照。",
    cancel: "取消",
    revert: "恢复",
    reverting: "正在恢复...",
    viewTitle: "版本控制",
    noMarkdownTitle: "未选择 Markdown 文件",
    noMarkdownBody: "打开一篇笔记后即可查看或创建版本快照。",
    currentNote: "当前笔记",
    snapshot: "创建快照",
    commitMessage: "提交信息",
    createdSnapshot: "已创建快照 {{id}}。",
    timeline: "时间线",
    newestFirst: "最新优先",
    noSnapshots: "还没有快照",
    noSnapshotsBody: "创建第一个快照，开始追踪这篇笔记。",
    view: "查看",
    details: "详情",
    selectSnapshot: "选择一个快照以查看元数据和差异。",
    message: "提交信息",
    created: "创建时间",
    author: "作者",
    unknown: "未知",
    hash: "哈希",
    diffTitle: "与当前文件对比",
    showingLines: "显示前 {{shown}} 行，共 {{total}} 行",
    noDifferences: "没有差异。",
    preview: "内容预览",
    snapshotBody: "快照正文",
    emptyFile: "（空文件）",
    restored: "已恢复 {{id}}。",
    ribbon: "打开版本控制",
    commandOpen: "打开版本控制面板",
    commandSnapshot: "为当前笔记创建版本快照",
    autoSnapshotFailed: "自动快照失败。请查看开发者控制台了解详情。",
    openFailed: "无法打开版本控制视图。",
    snapshotFailed: "快照创建失败。请查看开发者控制台了解详情。",
    settingsTitle: PLUGIN_NAME,
    storageFolder: "版本存储文件夹",
    storageFolderDesc: "保险库内用于保存历史 JSON 文件的文件夹。",
    autoOnSave: "保存时自动快照",
    autoOnSaveDesc: "Markdown 文件发生变化时自动创建版本。",
    maxVersions: "每个文件的最大版本数",
    maxVersionsDesc: "超过此数量后会清理较旧的快照。",
    authorDesc: "每个快照中记录的作者名称。",
    language: "语言",
    languageDesc: "选择插件界面语言。",
    languageAuto: "自动",
    languageEnglish: "English",
    languageChinese: "简体中文"
  }
} as const;

type TranslationKey = keyof typeof TRANSLATIONS.en;

function resolveLanguage(settings: VersionControlSettings): "en" | "zh-CN" {
  if (settings.language === "en" || settings.language === "zh-CN") {
    return settings.language;
  }

  const locale = `${moment.locale?.() ?? ""} ${navigator.language ?? ""}`.toLowerCase();
  return locale.includes("zh") ? "zh-CN" : "en";
}

function translate(settings: VersionControlSettings, key: TranslationKey, replacements: Record<string, string | number> = {}): string {
  let value: string = TRANSLATIONS[resolveLanguage(settings)][key] ?? TRANSLATIONS.en[key];
  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.split(`{{${name}}}`).join(String(replacement));
  }
  return value;
}

export class VersionController {
  private cache = new Map<string, FileHistory>();
  private suppressedAutoCommitPaths = new Set<string>();

  constructor(
    private app: App,
    private settings: VersionControlSettings
  ) {}

  updateSettings(settings: VersionControlSettings): void {
    this.settings = settings;
    this.cache.clear();
  }

  async commit(file: TFile, message: string): Promise<Version | null> {
    if (!this.isVersionableMarkdown(file)) {
      new Notice(translate(this.settings, "onlyMarkdown"));
      return null;
    }

    const content = await this.app.vault.read(file);
    const contentHash = await this.hash(content);
    const history = await this.loadHistory(file);

    if (history.currentHash === contentHash && history.versions.length > 0) {
      new Notice(translate(this.settings, "noChanges"));
      return null;
    }

    const version: Version = {
      id: (await this.hash(`${file.path}:${contentHash}:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: message.trim() || translate(this.settings, "manualSnapshot"),
      content,
      hash: contentHash,
      author: this.settings.author.trim() || undefined
    };

    history.filePath = file.path;
    history.currentHash = contentHash;
    history.versions = [version, ...history.versions].slice(0, this.settings.maxVersions);

    await this.saveHistory(file, history);
    this.cache.set(file.path, history);
    return version;
  }

  async autoCommit(file: TFile, content?: string): Promise<Version | null> {
    if (!this.settings.autoCommitOnSave || !this.isVersionableMarkdown(file)) {
      return null;
    }

    if (this.suppressedAutoCommitPaths.has(file.path)) {
      return null;
    }

    const fileContent = content ?? (await this.app.vault.read(file));
    const contentHash = await this.hash(fileContent);
    const history = await this.loadHistory(file);

    if (history.currentHash === contentHash) {
      return null;
    }

    const version: Version = {
      id: (await this.hash(`${file.path}:${contentHash}:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: translate(this.settings, "autoSnapshot", { name: file.basename }),
      content: fileContent,
      hash: contentHash,
      author: this.settings.author.trim() || undefined
    };

    history.filePath = file.path;
    history.currentHash = contentHash;
    history.versions = [version, ...history.versions].slice(0, this.settings.maxVersions);
    await this.saveHistory(file, history);
    this.cache.set(file.path, history);
    return version;
  }

  async loadHistory(file: TFile): Promise<FileHistory> {
    const cached = this.cache.get(file.path);
    if (cached) {
      return {
        ...cached,
        versions: [...cached.versions]
      };
    }

    const path = await this.getHistoryPath(file);
    let history: FileHistory = {
      filePath: file.path,
      versions: [],
      currentHash: ""
    };

    try {
      if (await this.app.vault.adapter.exists(path)) {
        const raw = await this.app.vault.adapter.read(path);
        history = this.normalizeHistory(JSON.parse(raw), file.path);
      }
    } catch (error) {
      console.error("Failed to load version history", error);
      new Notice(translate(this.settings, "loadHistoryFailed", { name: file.basename }));
    }

    this.cache.set(file.path, history);
    return {
      ...history,
      versions: [...history.versions]
    };
  }

  async revertToVersion(file: TFile, versionId: string): Promise<boolean> {
    const history = await this.loadHistory(file);
    const target = history.versions.find((version) => version.id === versionId);

    if (!target) {
      new Notice(translate(this.settings, "versionNotFound"));
      return false;
    }

    const currentContent = await this.app.vault.read(file);
    const currentHash = await this.hash(currentContent);
    if (currentHash !== history.currentHash || history.versions.length === 0) {
      await this.commit(file, translate(this.settings, "beforeRevert", { id: target.id }));
    }

    this.suppressedAutoCommitPaths.add(file.path);
    try {
      await this.app.vault.modify(file, target.content);
    } finally {
      window.setTimeout(() => this.suppressedAutoCommitPaths.delete(file.path), 1000);
    }

    const updatedHistory = await this.loadHistory(file);
    const restoredHash = await this.hash(target.content);
    const restoreVersion: Version = {
      id: (await this.hash(`${file.path}:${restoredHash}:restore:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: translate(this.settings, "revertMessage", { id: target.id, message: target.message }),
      content: target.content,
      hash: restoredHash,
      author: this.settings.author.trim() || undefined
    };

    updatedHistory.filePath = file.path;
    updatedHistory.currentHash = restoredHash;
    updatedHistory.versions = [restoreVersion, ...updatedHistory.versions].slice(0, this.settings.maxVersions);
    await this.saveHistory(file, updatedHistory);
    this.cache.set(file.path, updatedHistory);
    return true;
  }

  getVersionDiff(content1: string, content2: string): DiffLine[] {
    const oldLines = content1.split(/\r?\n/);
    const newLines = content2.split(/\r?\n/);
    const table = this.buildLcsTable(oldLines, newLines);
    const result: DiffLine[] = [];
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length && newIndex < newLines.length) {
      if (oldLines[oldIndex] === newLines[newIndex]) {
        result.push({
          type: "context",
          oldLine: oldIndex + 1,
          newLine: newIndex + 1,
          content: oldLines[oldIndex]
        });
        oldIndex++;
        newIndex++;
      } else if (table[oldIndex + 1]?.[newIndex] >= table[oldIndex]?.[newIndex + 1]) {
        result.push({
          type: "removed",
          oldLine: oldIndex + 1,
          content: oldLines[oldIndex]
        });
        oldIndex++;
      } else {
        result.push({
          type: "added",
          newLine: newIndex + 1,
          content: newLines[newIndex]
        });
        newIndex++;
      }
    }

    while (oldIndex < oldLines.length) {
      result.push({ type: "removed", oldLine: oldIndex + 1, content: oldLines[oldIndex] });
      oldIndex++;
    }

    while (newIndex < newLines.length) {
      result.push({ type: "added", newLine: newIndex + 1, content: newLines[newIndex] });
      newIndex++;
    }

    return result;
  }

  clearCacheFor(path: string): void {
    this.cache.delete(path);
  }

  isVersionableMarkdown(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile && file.extension === "md" && !file.path.startsWith(`${this.cleanVersionDir()}/`);
  }

  private async saveHistory(file: TFile, history: FileHistory): Promise<void> {
    await this.ensureVersionDir();
    const path = await this.getHistoryPath(file);
    await this.app.vault.adapter.write(path, JSON.stringify(history, null, 2));
  }

  private async ensureVersionDir(): Promise<void> {
    const dir = this.cleanVersionDir();
    const parts = dir.split("/").filter(Boolean);
    let current = "";

    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.adapter.mkdir(current);
      }
    }
  }

  private async getHistoryPath(file: TFile): Promise<string> {
    const safeName = file.basename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "note";
    const pathHash = (await this.hash(file.path)).slice(0, 8);
    return normalizePath(`${this.cleanVersionDir()}/${safeName}-${pathHash}.history.json`);
  }

  private cleanVersionDir(): string {
    return normalizePath(this.settings.versionDir.trim() || DEFAULT_SETTINGS.versionDir).replace(/\/+$/, "");
  }

  private normalizeHistory(raw: unknown, fallbackPath: string): FileHistory {
    const candidate = raw as Partial<FileHistory>;
    const versions = Array.isArray(candidate.versions)
      ? candidate.versions
          .filter((version): version is Version => {
            const item = version as Partial<Version>;
            return Boolean(item.id && typeof item.content === "string" && typeof item.timestamp === "number");
          })
          .sort((a, b) => b.timestamp - a.timestamp)
      : [];

    return {
      filePath: typeof candidate.filePath === "string" ? candidate.filePath : fallbackPath,
      versions,
      currentHash: typeof candidate.currentHash === "string" ? candidate.currentHash : versions[0]?.hash ?? ""
    };
  }

  private buildLcsTable(oldLines: string[], newLines: string[]): number[][] {
    const table = Array.from({ length: oldLines.length + 1 }, () => Array(newLines.length + 1).fill(0));

    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex--) {
      for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex--) {
        table[oldIndex][newIndex] =
          oldLines[oldIndex] === newLines[newIndex]
            ? table[oldIndex + 1][newIndex + 1] + 1
            : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
      }
    }

    return table;
  }

  private async hash(content: string): Promise<string> {
    const bytes = new TextEncoder().encode(content);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}

class ConfirmRevertModal extends Modal {
  private confirmed = false;

  constructor(
    app: App,
    private settings: VersionControlSettings,
    private version: Version,
    private onConfirm: () => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("gsvc-confirm-modal");
    contentEl.createEl("h2", { text: translate(this.settings, "confirmRevertTitle") });
    contentEl.createEl("p", {
      text: translate(this.settings, "confirmRevertBody", { id: this.version.id })
    });

    const actions = contentEl.createDiv("gsvc-modal-actions");
    actions.createEl("button", { text: translate(this.settings, "cancel") }).addEventListener("click", () => this.close());
    const confirmButton = actions.createEl("button", {
      text: translate(this.settings, "revert"),
      cls: "mod-warning"
    });
    confirmButton.addEventListener("click", async () => {
      if (this.confirmed) {
        return;
      }
      this.confirmed = true;
      confirmButton.setText(translate(this.settings, "reverting"));
      await this.onConfirm();
      this.close();
    });
  }
}

export class VersionControlView extends ItemView {
  private currentFile: TFile | null = null;
  private history: FileHistory | null = null;
  private selectedVersion: Version | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: VersionControlPlugin
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_VERSION_CONTROL;
  }

  getDisplayText(): string {
    return this.plugin.t("viewTitle");
  }

  getIcon(): string {
    return "git-branch";
  }

  async onOpen(): Promise<void> {
    this.containerEl.addClass("gsvc-view");
    await this.setFile(this.plugin.getActiveMarkdownFile());
  }

  async setFile(file: TFile | null): Promise<void> {
    this.currentFile = file;
    if (!file || !this.plugin.controller.isVersionableMarkdown(file)) {
      this.history = null;
      this.selectedVersion = null;
      this.renderEmpty();
      return;
    }

    this.history = await this.plugin.controller.loadHistory(file);
    this.selectedVersion = this.history.versions[0] ?? null;
    await this.render();
  }

  async refresh(): Promise<void> {
    if (this.currentFile) {
      this.plugin.controller.clearCacheFor(this.currentFile.path);
    }
    await this.setFile(this.currentFile ?? this.plugin.getActiveMarkdownFile());
  }

  private renderEmpty(): void {
    const content = this.contentEl;
    content.empty();
    const empty = content.createDiv("gsvc-empty");
    empty.createEl("div", { cls: "gsvc-empty-icon", text: "⌁" });
    empty.createEl("h3", { text: this.plugin.t("noMarkdownTitle") });
    empty.createEl("p", { text: this.plugin.t("noMarkdownBody") });
  }

  private async render(): Promise<void> {
    if (!this.currentFile || !this.history) {
      this.renderEmpty();
      return;
    }

    const content = this.contentEl;
    content.empty();
    const shell = content.createDiv("gsvc-shell");
    this.renderHeader(shell);

    const split = shell.createDiv("gsvc-split");
    this.renderTimeline(split);
    await this.renderDetails(split);
  }

  private renderHeader(parent: HTMLElement): void {
    if (!this.currentFile || !this.history) {
      return;
    }

    const header = parent.createDiv("gsvc-header");
    const titleWrap = header.createDiv("gsvc-title-wrap");
    titleWrap.createEl("div", { cls: "gsvc-eyebrow", text: this.plugin.t("currentNote") });
    titleWrap.createEl("h2", { text: this.currentFile.basename });
    titleWrap.createEl("div", { cls: "gsvc-path", text: this.currentFile.path });

    const actions = header.createDiv("gsvc-header-actions");
    const snapshotButton = actions.createEl("button", { cls: "gsvc-primary", text: this.plugin.t("snapshot") });
    snapshotButton.addEventListener("click", async () => {
      const message = window.prompt(this.plugin.t("commitMessage"), this.plugin.t("manualSnapshot"));
      if (message === null || !this.currentFile) {
        return;
      }
      const version = await this.plugin.controller.commit(this.currentFile, message);
      if (version) {
        new Notice(this.plugin.t("createdSnapshot", { id: version.id }));
      }
      await this.refresh();
    });

    actions.createEl("span", {
      cls: "gsvc-counter",
      text: `${this.history.versions.length}/${this.plugin.settings.maxVersions}`
    });
  }

  private renderTimeline(parent: HTMLElement): void {
    if (!this.history) {
      return;
    }

    const timeline = parent.createDiv("gsvc-timeline");
    const timelineHeader = timeline.createDiv("gsvc-panel-heading");
    timelineHeader.createEl("span", { text: this.plugin.t("timeline") });
    timelineHeader.createEl("small", { text: this.plugin.t("newestFirst") });

    const list = timeline.createDiv("gsvc-version-list");
    if (this.history.versions.length === 0) {
      const blank = list.createDiv("gsvc-blank-list");
      blank.createEl("strong", { text: this.plugin.t("noSnapshots") });
      blank.createEl("span", { text: this.plugin.t("noSnapshotsBody") });
      return;
    }

    this.history.versions.forEach((version, index) => {
      const item = list.createDiv({
        cls: `gsvc-version-item ${this.selectedVersion?.id === version.id ? "is-selected" : ""}`
      });

      const rail = item.createDiv("gsvc-rail");
      rail.createDiv(`gsvc-dot ${index === 0 ? "is-latest" : ""}`);

      const body = item.createDiv("gsvc-version-body");
      const top = body.createDiv("gsvc-version-top");
      top.createEl("strong", { text: version.message });
      top.createEl("code", { text: version.id });

      const meta = body.createDiv("gsvc-version-meta");
      meta.createSpan({ text: this.formatDate(version.timestamp) });
      if (version.author) {
        meta.createSpan({ text: version.author });
      }

      const actions = body.createDiv("gsvc-version-actions");
      const viewButton = actions.createEl("button", { text: this.plugin.t("view") });
      viewButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        this.selectedVersion = version;
        await this.render();
      });

      const revertButton = actions.createEl("button", { text: this.plugin.t("revert") });
      revertButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.confirmRevert(version);
      });

      item.addEventListener("click", async () => {
        this.selectedVersion = version;
        await this.render();
      });
    });
  }

  private async renderDetails(parent: HTMLElement): Promise<void> {
    const details = parent.createDiv("gsvc-details");
    const heading = details.createDiv("gsvc-panel-heading");
    heading.createEl("span", { text: this.plugin.t("details") });

    if (!this.currentFile || !this.history || !this.selectedVersion) {
      details.createDiv("gsvc-empty-details").setText(this.plugin.t("selectSnapshot"));
      return;
    }

    heading.createEl("small", { text: this.selectedVersion.id });

    const meta = details.createDiv("gsvc-meta-grid");
    this.renderMeta(meta, this.plugin.t("message"), this.selectedVersion.message);
    this.renderMeta(meta, this.plugin.t("created"), this.formatDate(this.selectedVersion.timestamp));
    this.renderMeta(meta, this.plugin.t("author"), this.selectedVersion.author || this.plugin.t("unknown"));
    this.renderMeta(meta, this.plugin.t("hash"), this.selectedVersion.hash.slice(0, 16));

    const currentContent = await this.app.vault.read(this.currentFile);
    const diff = this.plugin.controller.getVersionDiff(this.selectedVersion.content, currentContent);
    this.renderStats(details, diff);
    this.renderDiff(details, diff);
    this.renderPreview(details, this.selectedVersion.content);
  }

  private renderMeta(parent: HTMLElement, label: string, value: string): void {
    const item = parent.createDiv("gsvc-meta-item");
    item.createEl("span", { text: label });
    item.createEl("strong", { text: value });
  }

  private renderStats(parent: HTMLElement, diff: DiffLine[]): void {
    const additions = diff.filter((line) => line.type === "added").length;
    const removals = diff.filter((line) => line.type === "removed").length;
    const stats = parent.createDiv("gsvc-stats");
    stats.createSpan({ cls: "gsvc-added", text: `+${additions}` });
    stats.createSpan({ cls: "gsvc-removed", text: `-${removals}` });
  }

  private renderDiff(parent: HTMLElement, diff: DiffLine[]): void {
    const block = parent.createDiv("gsvc-section");
    const title = block.createDiv("gsvc-section-title");
    title.createEl("span", { text: this.plugin.t("diffTitle") });
    if (diff.length > 50) {
      title.createEl("small", { text: this.plugin.t("showingLines", { shown: 50, total: diff.length }) });
    }

    const diffEl = block.createDiv("gsvc-diff");
    const visibleLines = diff.slice(0, 50);
    if (visibleLines.length === 0) {
      diffEl.createDiv("gsvc-diff-empty").setText(this.plugin.t("noDifferences"));
      return;
    }

    visibleLines.forEach((line) => {
      const row = diffEl.createDiv(`gsvc-diff-line is-${line.type}`);
      row.createEl("span", {
        cls: "gsvc-line-no",
        text: `${line.oldLine ?? ""}${line.oldLine && line.newLine ? " " : ""}${line.newLine ?? ""}`
      });
      row.createEl("span", {
        cls: "gsvc-line-marker",
        text: line.type === "added" ? "+" : line.type === "removed" ? "-" : " "
      });
      row.createEl("code", { text: line.content || " " });
    });
  }

  private renderPreview(parent: HTMLElement, content: string): void {
    const block = parent.createDiv("gsvc-section");
    const title = block.createDiv("gsvc-section-title");
    title.createEl("span", { text: this.plugin.t("preview") });
    title.createEl("small", { text: this.plugin.t("snapshotBody") });
    block.createEl("pre", { cls: "gsvc-preview", text: content.slice(0, 8000) || this.plugin.t("emptyFile") });
  }

  private confirmRevert(version: Version): void {
    if (!this.currentFile) {
      return;
    }

    new ConfirmRevertModal(this.app, this.plugin.settings, version, async () => {
      if (!this.currentFile) {
        return;
      }
      const restored = await this.plugin.controller.revertToVersion(this.currentFile, version.id);
      if (restored) {
        new Notice(this.plugin.t("restored", { id: version.id }));
        await this.refresh();
      }
    }).open();
  }

  private formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }
}

export default class VersionControlPlugin extends Plugin {
  settings: VersionControlSettings = DEFAULT_SETTINGS;
  controller!: VersionController;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.controller = new VersionController(this.app, this.settings);

    this.registerView(VIEW_TYPE_VERSION_CONTROL, (leaf) => new VersionControlView(leaf, this));
    this.addRibbonIcon("git-branch", this.t("ribbon"), () => this.activateView());

    this.addCommand({
      id: "open-version-control",
      name: this.t("commandOpen"),
      callback: () => this.activateView()
    });

    this.addCommand({
      id: "create-version-snapshot",
      name: this.t("commandSnapshot"),
      checkCallback: (checking) => {
        const file = this.getActiveMarkdownFile();
        if (!file) {
          return false;
        }
        if (!checking) {
          this.createSnapshotForFile(file);
        }
        return true;
      }
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async () => {
        const view = this.getView();
        if (view) {
          await view.setFile(this.getActiveMarkdownFile());
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (!this.controller.isVersionableMarkdown(file)) {
          return;
        }
        try {
          const version = await this.controller.autoCommit(file);
          if (version) {
            const view = this.getView();
            if (view) {
              await view.refresh();
            }
          }
        } catch (error) {
          console.error("Auto snapshot failed", error);
          new Notice(this.t("autoSnapshotFailed"));
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        this.controller.clearCacheFor(file.path);
      })
    );

    this.addSettingTab(new VersionControlSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_VERSION_CONTROL);
  }

  async loadSettings(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData())
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.controller?.updateSettings(this.settings);
  }

  t(key: TranslationKey, replacements: Record<string, string | number> = {}): string {
    return translate(this.settings, key, replacements);
  }

  getActiveMarkdownFile(): TFile | null {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = markdownView?.file ?? this.app.workspace.getActiveFile();
    return this.controller?.isVersionableMarkdown(file) ? file : null;
  }

  async activateView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VERSION_CONTROL);
    const leaf = leaves[0] ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      new Notice(this.t("openFailed"));
      return;
    }

    await leaf.setViewState({ type: VIEW_TYPE_VERSION_CONTROL, active: true });
    this.app.workspace.revealLeaf(leaf);
    await this.getView()?.setFile(this.getActiveMarkdownFile());
  }

  private async createSnapshotForFile(file: TFile): Promise<void> {
    const message = window.prompt(this.t("commitMessage"), this.t("manualSnapshot"));
    if (message === null) {
      return;
    }

    try {
      const version = await this.controller.commit(file, message);
      if (version) {
        new Notice(this.t("createdSnapshot", { id: version.id }));
        await this.getView()?.refresh();
      }
    } catch (error) {
      console.error("Snapshot failed", error);
      new Notice(this.t("snapshotFailed"));
    }
  }

  private getView(): VersionControlView | null {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VERSION_CONTROL);
    return leaves[0]?.view instanceof VersionControlView ? leaves[0].view : null;
  }
}

class VersionControlSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: VersionControlPlugin
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: this.plugin.t("settingsTitle") });

    new Setting(containerEl)
      .setName(this.plugin.t("language"))
      .setDesc(this.plugin.t("languageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", this.plugin.t("languageAuto"))
          .addOption("en", this.plugin.t("languageEnglish"))
          .addOption("zh-CN", this.plugin.t("languageChinese"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as LanguageSetting;
            await this.plugin.saveSettings();
            this.display();
            await this.plugin.activateView();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("storageFolder"))
      .setDesc(this.plugin.t("storageFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder(".versions")
          .setValue(this.plugin.settings.versionDir)
          .onChange(async (value) => {
            this.plugin.settings.versionDir = normalizePath(value.trim() || DEFAULT_SETTINGS.versionDir);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("autoOnSave"))
      .setDesc(this.plugin.t("autoOnSaveDesc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoCommitOnSave).onChange(async (value) => {
          this.plugin.settings.autoCommitOnSave = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("maxVersions"))
      .setDesc(this.plugin.t("maxVersionsDesc"))
      .addText((text) =>
        text
          .setPlaceholder("50")
          .setValue(String(this.plugin.settings.maxVersions))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            this.plugin.settings.maxVersions = Number.isFinite(parsed) ? Math.max(1, parsed) : DEFAULT_SETTINGS.maxVersions;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("author"))
      .setDesc(this.plugin.t("authorDesc"))
      .addText((text) =>
        text
          .setPlaceholder("User")
          .setValue(this.plugin.settings.author)
          .onChange(async (value) => {
            this.plugin.settings.author = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
