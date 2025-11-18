const urlParams = new URLSearchParams(window.location.search);
const currentViewPage = urlParams.get("currentPage");

export async function populateFragments() {
  if (currentViewPage == "home") {
    return;
  };
  const partialsMap = {
    ".lios-header-nav": "../includes/header-nav.html",
    ".window-container": "../includes/windows.html"
  };

  for (const [selector, file] of Object.entries(partialsMap)) {
    const container = document.querySelector(selector);

    if (container && container.innerHTML.trim() === "") {
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to fetch ${file}`);
        container.innerHTML = await res.text();
      } catch (err) {
        container.innerHTML = `<!--Error loading ${file}-->`;
      }
    }
  }
}