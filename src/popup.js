// Popup script
document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");
  const refreshBtn = document.getElementById("refreshBtn");

  // Inicializuj lokalizované texty
  function initializeLocalization() {
    document.getElementById("popupTitle").textContent =
      chrome.i18n.getMessage("popupTitle") || "jQuery Detector";
    document.getElementById("loadingText").textContent =
      chrome.i18n.getMessage("loading") || "Načítání...";
    document.getElementById("refreshBtn").textContent =
      chrome.i18n.getMessage("refreshButton") || "🔄 Aktualizovat";

    // Nastav verzi extension z manifestu
    const manifest = chrome.runtime.getManifest();
    document.getElementById(
      "extensionVersion"
    ).textContent = `v${manifest.version}`;
  }

  function displayJQueryInfo(jqueryInfo) {
    let html = "";

    // Status - vylepšená logika s barvami podle verze
    const hasJQuery =
      jqueryInfo.loaded ||
      jqueryInfo.sources.length > 0 ||
      jqueryInfo.version !== null;

    if (hasJQuery) {
      // Určíme hlavní verzi pro barvu
      let bgColor = "#388e3c"; // zelená pro 3.x+

      if (jqueryInfo.version) {
        const versionMatch = jqueryInfo.version.match(/^(\d+)\./);
        if (versionMatch) {
          const majorVersion = parseInt(versionMatch[1]);

          if (majorVersion === 1) {
            bgColor = "#d32f2f"; // červená pro jQuery 1.x
          } else if (majorVersion === 2) {
            bgColor = "#f57c00"; // oranžová pro jQuery 2.x
          }
        }
      }

      html += `<div class="status found" style="background-color: ${bgColor}; color: white; border-color: ${bgColor};">${
        chrome.i18n.getMessage("jqueryFound") || "✅ jQuery found!"
      }</div>`;
    } else {
      html += `<div class="status not-found">${
        chrome.i18n.getMessage("jqueryNotFound") || "❌ jQuery not found"
      }</div>`;
    }

    // Verze
    if (jqueryInfo.version) {
      html += `
                <div class="info-section">
                    <h3>${chrome.i18n.getMessage("versionLabel")}</h3>
                    <div class="version">${jqueryInfo.version}</div>
                </div>
            `;
    }

    // Zdroje
    if (jqueryInfo.sources.length > 0) {
      html += `
                <div class="info-section">
                    <h3>${chrome.i18n.getMessage("sourcesLabel")} (${
        jqueryInfo.sources.length
      })</h3>
                    <div class="sources-list">
            `;

      jqueryInfo.sources.forEach((source) => {
        const typeLabels = {
          script_tag:
            chrome.i18n.getMessage("sourceTypeScript") || "Script Tag",
          link_tag: chrome.i18n.getMessage("sourceTypeLink") || "Link Tag",
          es6_import:
            chrome.i18n.getMessage("sourceTypeImport") || "ES6 Import",
          resource: chrome.i18n.getMessage("sourceTypeResource") || "Resource",
        };

        html += `
                    <div class="source-item">
                        <div class="source-type">${
                          typeLabels[source.type] || source.type
                        }</div>
                        <a href="${
                          source.url
                        }" class="source-url" target="_blank" title="${
          source.url
        }">
                            ${
                              source.url.length > 60
                                ? source.url.substring(0, 60) + "..."
                                : source.url
                            }
                        </a>
                    </div>
                `;
      });

      html += "</div></div>";
    } else if (hasJQuery && jqueryInfo.loaded) {
      // jQuery je nalezeno, ale nemáme žádné zdroje - pravděpodobně bundled
      html += `
                <div class="info-section">
                    <h3>${
                      chrome.i18n.getMessage("sourcesLabel") || "jQuery Sources"
                    }</h3>
                    <div style="font-size: 12px; color: #6c757d; font-style: italic; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                        ℹ️ ${
                          chrome.i18n.getMessage("bundledJQuery") ||
                          "jQuery is likely loaded in a build script (webpack, vite, rollup...)."
                        }
                    </div>
                </div>
            `;
    }

    // Dodatečné info
    if (jqueryInfo.loaded) {
      html += `
                <div class="info-section">
                    <h3>${chrome.i18n.getMessage("statusLabel")}</h3>
                    <div style="font-size: 12px; color: #28a745;">
                        ${
                          jqueryInfo.globalObject
                            ? chrome.i18n.getMessage("globalObjectFound")
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    contentDiv.innerHTML = html;
  }

  function loadJQueryInfo() {
    // Pošleme zprávu do background aby spustil detekci
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.runtime.sendMessage(
          {
            action: "detectJQueryForPopup",
            tabId: tabs[0].id,
          },
          function (response) {
            if (response && response.jqueryInfo) {
              displayJQueryInfo(response.jqueryInfo);
            } else {
              contentDiv.innerHTML = `
                <div class="status not-found">
                  ${
                    chrome.i18n.getMessage("cannotLoadInfo") ||
                    "Cannot load information"
                  }
                </div>
              `;
            }
          }
        );
      }
    });
  }

  // Event listenery
  refreshBtn.addEventListener("click", function () {
    contentDiv.innerHTML = `<div class="loading">${chrome.i18n.getMessage(
      "updating"
    )}</div>`;

    // Načteme znovu z background
    setTimeout(loadJQueryInfo, 100);
  });

  // Inicializuj lokalizaci a načti informace při otevření popup
  initializeLocalization();
  loadJQueryInfo();
});
