const initAppLoader = (() => {
    const mainContainer = document.querySelector(".main-container");
    const loader = document.querySelector("body > .lios-loader-3");
    window.addEventListener("load", () => {
        loader.style.display = "none";
        mainContainer.style.display = "unset";
    });
})();