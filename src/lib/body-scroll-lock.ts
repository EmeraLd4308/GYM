let depth = 0;
let savedOverflow = "";

export function bodyScrollLockPush(): void {
  if (typeof document === "undefined") return;
  if (depth++ === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

export function bodyScrollLockPop(): void {
  if (typeof document === "undefined") return;
  if (--depth <= 0) {
    depth = 0;
    document.body.style.overflow = savedOverflow;
  }
}
