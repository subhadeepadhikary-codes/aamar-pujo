/**
 * Visited Pandals Tracker ("Pandal Passport")
 * Persists seen/visited pandals to localStorage and dispatches reactive events.
 */

const STORAGE_KEY = "aamar_pujo_visited_pandals";

function getVisitedSet() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(Number) : []);
  } catch (err) {
    console.warn("Failed to read visited pandals:", err);
    return new Set();
  }
}

function saveVisitedSet(visitedSet) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  try {
    const arr = Array.from(visitedSet);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn("Failed to save visited pandals:", err);
  }
}

function notifyChange(pandalId, isVisited) {
  if (typeof window !== "undefined") {
    const count = getVisitedCount();
    window.dispatchEvent(
      new CustomEvent("aamar-visited-changed", {
        detail: { pandalId: Number(pandalId), isVisited, totalCount: count }
      })
    );
  }
}

export function isPandalVisited(pandalId) {
  if (!pandalId && pandalId !== 0) return false;
  const set = getVisitedSet();
  return set.has(Number(pandalId));
}

export function togglePandalVisited(pandalId) {
  if (!pandalId && pandalId !== 0) return false;
  const idNum = Number(pandalId);
  const set = getVisitedSet();
  let nextState = false;

  if (set.has(idNum)) {
    set.delete(idNum);
    nextState = false;
  } else {
    set.add(idNum);
    nextState = true;
  }

  saveVisitedSet(set);
  notifyChange(idNum, nextState);
  return nextState;
}

export function markPandalVisited(pandalId) {
  if (!pandalId && pandalId !== 0) return;
  const idNum = Number(pandalId);
  const set = getVisitedSet();
  if (!set.has(idNum)) {
    set.add(idNum);
    saveVisitedSet(set);
    notifyChange(idNum, true);
  }
}

export function unmarkPandalVisited(pandalId) {
  if (!pandalId && pandalId !== 0) return;
  const idNum = Number(pandalId);
  const set = getVisitedSet();
  if (set.has(idNum)) {
    set.delete(idNum);
    saveVisitedSet(set);
    notifyChange(idNum, false);
  }
}

export function getVisitedPandalIds() {
  return Array.from(getVisitedSet());
}

export function getVisitedCount() {
  return getVisitedSet().size;
}

export function clearVisitedPandals() {
  saveVisitedSet(new Set());
  notifyChange(null, false);
}
