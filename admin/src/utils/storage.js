export function getStorage(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch {
    return null;
  }
}

export function setStorage(key, value) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Storage set error:', error);
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Storage remove error:', error);
  }
}
