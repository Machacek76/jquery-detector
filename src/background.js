// Background script pro jQuery Detector
(function () {
  "use strict";

  // Nastaví ikonu podle verze jQuery
  function setIconByVersion(tabId, hasJQuery, majorVersion) {
    let iconPath = {
      16: "icons/icon16-gray.png",
      48: "icons/icon48-gray.png",
      128: "icons/icon128-gray.png",
    };

    let badgeText = "";
    let badgeColor = "";

    if (hasJQuery && majorVersion) {
      switch (majorVersion) {
        case 1:
          iconPath = {
            16: "icons/icon16-red.png",
            48: "icons/icon48-red.png",
            128: "icons/icon128-red.png",
          };
          badgeText = "1.x";
          badgeColor = "#d32f2f";
          break;
        case 2:
          iconPath = {
            16: "icons/icon16-orange.png",
            48: "icons/icon48-orange.png",
            128: "icons/icon128-orange.png",
          };
          badgeText = "2.x";
          badgeColor = "#f57c00";
          break;
        case 3:
          iconPath = {
            16: "icons/icon16-green.png",
            48: "icons/icon48-green.png",
            128: "icons/icon128-green.png",
          };
          badgeText = "3.x";
          badgeColor = "#388e3c";
          break;
        default:
          // Pro verze 4+ použijeme zelenou
          iconPath = {
            16: "icons/icon16-green.png",
            48: "icons/icon48-green.png",
            128: "icons/icon128-green.png",
          };
          badgeText = majorVersion + ".x";
          badgeColor = "#388e3c";
      }
    } else if (hasJQuery) {
      // jQuery nalezeno, ale verze není známa - použijeme modrou
      iconPath = {
        16: "icons/icon16-blue.png",
        48: "icons/icon48-blue.png",
        128: "icons/icon128-blue.png",
      };
      badgeText = "?";
      badgeColor = "#1976d2";
    }
    // Jinak zůstane šedá ikona (výchozí stav nahoře)

    // Nastavíme ikonu
    chrome.action.setIcon({
      tabId: tabId,
      path: iconPath,
    });

    // Nastavíme badge
    chrome.action.setBadgeText({
      tabId: tabId,
      text: badgeText,
    });

    if (badgeColor) {
      chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: badgeColor,
      });
    }

    // Nastavíme barvu textu badge na bílou pro lepší čitelnost
    if (chrome.action.setBadgeTextColor) {
      chrome.action.setBadgeTextColor({
        tabId: tabId,
        color: "#FFFFFF",
      });
    }
  }

  // Funkce pro detekci jQuery - spustí se v MAIN world
  function detectJQueryInMainWorld() {
    const jqueryInfo = {
      version: null,
      sources: [],
      loaded: false,
      globalObject: false,
    };

    // Zkontroluj, jestli je jQuery dostupné jako globální objekt
    if (typeof window.jQuery !== "undefined") {
      jqueryInfo.loaded = true;
      jqueryInfo.globalObject = true;

      // Zkus různé způsoby získání verze
      if (window.jQuery.fn && window.jQuery.fn.jquery) {
        jqueryInfo.version = window.jQuery.fn.jquery;
      } else if (window.jQuery.prototype && window.jQuery.prototype.jquery) {
        jqueryInfo.version = window.jQuery.prototype.jquery;
      } else if (window.jQuery.version) {
        jqueryInfo.version = window.jQuery.version;
      }
    }

    // Zkontroluj, jestli je $ dostupné
    if (typeof window.$ !== "undefined" && window.$.fn && window.$.fn.jquery) {
      if (!jqueryInfo.loaded) {
        jqueryInfo.loaded = true;
        jqueryInfo.globalObject = true;
      }
      if (!jqueryInfo.version) {
        jqueryInfo.version = window.$.fn.jquery;
      }
    }

    // Najdi script tagy s jQuery
    const scripts = document.querySelectorAll("script[src]");
    const foundUrls = new Set();

    scripts.forEach((script) => {
      const src = script.src;
      if (src) {
        // Kontrola na jQuery v URL (case-insensitive)
        const lowerSrc = src.toLowerCase();
        if (
          lowerSrc.includes("jquery") ||
          lowerSrc.match(/\/jquery[-._]?\d/i) ||
          lowerSrc.match(/jquery[-._]?min/i) ||
          lowerSrc.match(/jquery[-._]?\d+\.\d+/i)
        ) {
          if (!foundUrls.has(src)) {
            foundUrls.add(src);
            jqueryInfo.sources.push({
              url: src,
              type: "script_tag",
            });
          }
        }
      }
    });

    // Zkus Performance API pro dynamicky načtené zdroje
    if (typeof performance !== "undefined" && performance.getEntriesByType) {
      try {
        const resources = performance.getEntriesByType("resource");

        resources.forEach((resource) => {
          const url = resource.name;
          if (url) {
            const lowerUrl = url.toLowerCase();
            if (
              lowerUrl.includes("jquery") ||
              lowerUrl.match(/\/jquery[-._]?\d/i) ||
              lowerUrl.match(/jquery[-._]?min/i) ||
              lowerUrl.match(/jquery[-._]?\d+\.\d+/i)
            ) {
              if (!foundUrls.has(url)) {
                foundUrls.add(url);
                jqueryInfo.sources.push({
                  url: url,
                  type: "resource",
                });
              }
            }
          }
        });
      } catch (e) {
        // Chyba při Performance API
      }
    }

    return jqueryInfo;
  }

  // Poslouchej zprávy z content scriptu a popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Zpráva z popup - požadavek na detekci pro zobrazení
    if (message.action === "detectJQueryForPopup" && message.tabId) {
      // Spustíme detekci v MAIN world kontextu
      chrome.scripting.executeScript(
        {
          target: { tabId: message.tabId },
          world: "MAIN",
          func: detectJQueryInMainWorld,
        },
        function (results) {
          if (chrome.runtime.lastError) {
            sendResponse({ jqueryInfo: null });
            return;
          }

          if (results && results[0] && results[0].result) {
            const jqueryInfo = results[0].result;

            // Určíme hlavní verzi a nastavíme ikonu
            let majorVersion = null;
            let hasJQuery =
              jqueryInfo.loaded ||
              jqueryInfo.sources.length > 0 ||
              jqueryInfo.version !== null;

            if (jqueryInfo.version) {
              const versionMatch = jqueryInfo.version.match(/^(\d+)\./);
              if (versionMatch) {
                majorVersion = parseInt(versionMatch[1]);
              }
            }

            setIconByVersion(message.tabId, hasJQuery, majorVersion);

            // Vrátíme výsledek do popup
            sendResponse({ jqueryInfo: jqueryInfo });
          } else {
            sendResponse({ jqueryInfo: null });
          }
        }
      );

      // Musíme vrátit true aby sendResponse fungoval asynchronně
      return true;
    }

    // Zpráva z content scriptu - automatická detekce při načtení stránky
    if (message.action === "detectJQuery" && sender.tab) {
      // Spustíme detekci v MAIN world kontextu
      chrome.scripting.executeScript(
        {
          target: { tabId: sender.tab.id },
          world: "MAIN",
          func: detectJQueryInMainWorld,
        },
        function (results) {
          if (chrome.runtime.lastError) {
            return;
          }

          if (results && results[0] && results[0].result) {
            const jqueryInfo = results[0].result;

            // Určíme hlavní verzi
            let majorVersion = null;
            let hasJQuery =
              jqueryInfo.loaded ||
              jqueryInfo.sources.length > 0 ||
              jqueryInfo.version !== null;

            if (jqueryInfo.version) {
              const versionMatch = jqueryInfo.version.match(/^(\d+)\./);
              if (versionMatch) {
                majorVersion = parseInt(versionMatch[1]);
              }
            }

            // Nastavíme ikonu
            setIconByVersion(sender.tab.id, hasJQuery, majorVersion);
          }
        }
      );
    } else if (message.action === "jqueryDetected" && sender.tab) {
      setIconByVersion(sender.tab.id, message.hasJQuery, message.majorVersion);
    }
  });

  // Resetuj ikonu při navigaci na novou stránku
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      // Resetuj na šedou ikonu
      setIconByVersion(tabId, false, null);
    }
  });
})();
