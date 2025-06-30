function clampToHeight(el) {
    const fullText = el.textContent;
    const originalHeight = el.clientHeight;

    let low = 0, high = fullText.length, mid;
    el.textContent = fullText;

    if (el.scrollHeight <= originalHeight) return; // No overflow

    while (low < high) {
      mid = Math.floor((low + high) / 2);
      el.textContent = fullText.slice(0, mid) + '...';

      if (el.scrollHeight > originalHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    el.textContent = fullText.slice(0, high) + '...';
    el.classList.add("clamped");
  }

const elements = document.getElementsByClassName("text_clamp");
for (let i = 0; i < elements.length; i++) {
  clampToHeight(elements[i]);
}