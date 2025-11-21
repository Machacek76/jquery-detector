// Content script pro detekci jQuery
(function () {
  "use strict";

  // Pošleme zprávu do background aby spustil detekci v MAIN world
  function requestJQueryDetection() {
    chrome.runtime.sendMessage({
      action: "detectJQuery",
    });
  }

  // Opožděná detekce
  function delayedDetection(delay) {
    setTimeout(() => {
      requestJQueryDetection();
    }, delay);
  }

  // Spustíme detekci
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => delayedDetection(0));
  } else {
    delayedDetection(0);
  }

  // Více pokusů pro asynchronní načítání
  delayedDetection(500);
  delayedDetection(1000);
  delayedDetection(2000);
  delayedDetection(5000);

  // Poslouchej custom eventy
  window.addEventListener("jqueryLoaded", () => {
    setTimeout(requestJQueryDetection, 100);
  });

  window.addEventListener("jqueryRemoved", () => {
    setTimeout(requestJQueryDetection, 100);
  });

  // Sleduj změny v DOM
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            (node.tagName === "SCRIPT" || node.tagName === "LINK")
          ) {
            if (node.src && node.src.toLowerCase().includes("jquery")) {
              shouldCheck = true;
            }
          }
        });
      }
    });
    if (shouldCheck) {
      setTimeout(requestJQueryDetection, 100);
      setTimeout(requestJQueryDetection, 500);
    }
  });

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    });
  }
})();
