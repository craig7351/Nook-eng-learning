export interface SubtitleLine {
  id: string;
  startTime: number;
  endTime: number;
  textEn: string;
  textZh: string;
}

export interface DictionaryEntry {
  word: string;
  partOfSpeech: string;
  definitionEn: string;
  definitionZh: string;
  ipa: string;
  exampleEn: string;
  exampleZh: string;
}

export interface VideoMeta {
  id: string;
  title: string;
  thumbnail?: string;
}

export enum AppState {
  IDLE,
  LOADING,
  READY,
  ERROR
}