import { objectsEqual } from "../utils/assert";

const STORAGE_KEY = "block-clock-data";

export function clearCachedContext() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCachedContext(): any | {} {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

export function updateCachedContext(newContext: any) {
  const excludeKeys = ["rpcUser", "rpcPassword", "connectErrorCount"];
  const filteredContext = Object.keys(newContext)
    .filter((key) => !excludeKeys.includes(key))
    .reduce((obj: any, key: any) => {
      obj[key] = newContext[key];
      return obj;
    }, {});
  if (!objectsEqual(getCachedContext(), filteredContext)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredContext));
  }
}
