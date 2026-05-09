export interface Version {
  id: string;
  timestamp: number;
  message: string;
  content: string;
  hash: string;
  author?: string;
}

export interface FileHistory {
  filePath: string;
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
