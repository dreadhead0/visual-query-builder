import type { QueryHistoryEntry, SavedQueryPreset } from "./types";

const QUERY_HISTORY_STORAGE_KEY = "visual-query-builder:query-history";
const SAVED_PRESETS_STORAGE_KEY = "visual-query-builder:saved-presets";

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStorageValue<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeStorageValue<T>(key: string, value: T) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readQueryHistory() {
  return readStorageValue<QueryHistoryEntry[]>(QUERY_HISTORY_STORAGE_KEY, []);
}

export function writeQueryHistory(history: QueryHistoryEntry[]) {
  writeStorageValue(QUERY_HISTORY_STORAGE_KEY, history);
}

export function readSavedPresets() {
  return readStorageValue<SavedQueryPreset[]>(SAVED_PRESETS_STORAGE_KEY, []);
}

export function writeSavedPresets(presets: SavedQueryPreset[]) {
  writeStorageValue(SAVED_PRESETS_STORAGE_KEY, presets);
}