let metadata;
async function fetchMetadata() {
    let response;
    const possiblePaths = [
        "./metadata.json",      // For root index.html
        "../metadata.json"   // For other pages
    ];
    
    let lastError;
    
    for (const path of possiblePaths) {
        try {
            response = await fetch(path);
            if (response.ok) {
                metadata = await response.json();
                console.log(`Successfully loaded metadata from: ${path}`);
                return;
            }
        } catch (error) {
            lastError = error;
            console.log(`Failed to load metadata from ${path}:`, error.message);
        }
    }
    
    // If we get here, none of the paths worked
    throw new Error(`Could not load metadata.JSON from any of the expected locations: ${possiblePaths.join(', ')}. Last error: ${lastError?.message}`);
}
export async function updateAboutWindow() {
    await fetchMetadata();
    document.querySelector(".project-title").textContent = metadata.projectName;
    document.querySelector(".project-description").textContent = metadata.projectDescription;
    document.querySelector(".project-version").textContent = metadata.version;
    document.querySelector(".project-channel").textContent = metadata.channel;

    const licenses = metadata.licenses;
    const licenseContainer = document.querySelector(".license-container");

    licenses.forEach(license => {
        const newElement = document.createElement("a");
        newElement.href = license.copy;
        newElement.className = "lios-window-value-row";
        newElement.innerHTML = `<span class="key">${license.for}</span> <span class = "value">${license.license}</span>`;
        licenseContainer.appendChild(newElement);
    });
}