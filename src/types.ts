export interface Version {
  id: string;
  timestamp: number;
  message: string;
  content: string;
  hash: string;
  filePath: string;
  fileName: string;
  changeType: "manual" | "auto" | "rename" | "restore";
  previousFilePath?: string;
  previousFileName?: string;
  additions?: number;
  deletions?: number;
  wordCount?: number;
  charCount?: number;
}

export interface FileHistory {
  historyId?: string;
  filePath: string;
  fileName?: string;
  versions: Version[];
  currentHash: string;
}

export type DiffType = "context" | "added" | "removed";

export interface DiffLine {
  type: DiffType;
  oldLine?: number;
  newLine?: number;
  content: string;
}

export interface WordStats {
  words: number;
  chars: number;
  lines: number;
}
