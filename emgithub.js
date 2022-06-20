/* source: https://emgithub.com/embed.js */

function embed(parameters) {
  const sourceURL = new URL("http://url?"+parameters);
  const params = sourceURL.searchParams;
  const target = new URL(params.get("target"));
  const style = params.get("style");
  const trickyDarkStyle = ["an-old-hope", "androidstudio", "arta", "codepen-embed", "darcula", "dracula", "far", "gml", "hopscotch", "hybrid", "monokai", "monokai-sublime", "nord", "obsidian", "ocean", "railscasts", "rainbow", "shades-of-purple", "sunburst", "vs2015", "xt256", "zenburn"]; // dark styles without 'dark', 'black' or 'night' in its name
  const isDarkStyle = style.includes("dark") || style.includes("black") || style.includes("night") || trickyDarkStyle.includes(style);
  const showBorder = params.get("showBorder") === "on";
  const showLineNumbers = params.get("showLineNumbers") === "on";
  const showFileMeta = params.get("showFileMeta") === "on";
  const showCopy = params.get("showCopy") === "on";
  const fetchFromJsDelivr = params.get("fetchFromJsDelivr") === "on";
  const lineSplit = target.hash.split("-");
  const startLine = target.hash !== "" && lineSplit[0].replace("#L", "") || -1;
  const endLine = target.hash !== "" && lineSplit.length > 1 && lineSplit[1].replace("L", "") || startLine;
  const tabSize = target.searchParams.get("ts") || 8;
  const pathSplit = target.pathname.split("/");
  const user = pathSplit[1];
  const repository = pathSplit[2];
  const branch = pathSplit[4];
  const file = pathSplit.slice(5, pathSplit.length).join("/");
  const fileExtension = file.split('.').length > 1 ? file.split('.')[file.split('.').length - 1] : 'txt';
  const rawFileURL = fetchFromJsDelivr
    ? `https://cdn.jsdelivr.net/gh/${user}/${repository}@${branch}/${file}`
    : `https://raw.githubusercontent.com/${user}/${repository}/${branch}/${file}`;
  // The id where code will be embeded. In order to support a single `target` embedded for multiple times,
  // we use a random string to avoid duplicated id.
  const containerId = Math.random().toString(36).substring(2);

  // Reserving space for code area should be done in early time
  // or the div may not be found later
  document.write(`<div id="${containerId}" class="emgithub-container"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`);

  const HLJSURL = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.17.1/build/highlight.min.js";
  const HLJSNumURL = "https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.8.0/dist/highlightjs-line-numbers.min.js";
  const loadHLJS = (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") ?
    Promise.resolve() : loadScript(HLJSURL);
  let loadHLJSNum;
  if (showLineNumbers) {
    // hljs-num should be loaded only after hljs is loaded
    loadHLJSNum = loadHLJS.then(() =>
      (typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined") ?
        Promise.resolve() : loadScript(HLJSNumURL)
    )
  }

  const fetchFile = fetch(rawFileURL).then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      return Promise.reject(`${response.status} ${response.statusText}`);
    }
  });

  Promise.all(showLineNumbers ? [fetchFile, loadHLJS, loadHLJSNum] : [fetchFile, loadHLJS]).then((result) => {
    const targetDiv = document.getElementById(containerId);
    embedCodeToTarget(targetDiv, result[0], showBorder, showLineNumbers, showFileMeta, showCopy, isDarkStyle, target.href, rawFileURL, fileExtension, startLine, endLine, tabSize, sourceURL.origin);
  }).catch((error) => {
    const errorMsg = `Failed to process ${rawFileURL}
${error}`;
    const targetDiv = document.getElementById(containerId);
    embedCodeToTarget(targetDiv, errorMsg, showBorder, showLineNumbers, showFileMeta, showCopy, isDarkStyle, target.href, rawFileURL, 'plaintext', -1, -1, tabSize, sourceURL.origin);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}


function embedCodeToTarget(targetDiv, codeText, showBorder, showLineNumbers, showFileMeta, showCopy, isDarkStyle, fileURL, rawFileURL, lang, startLine, endLine, tabSize, serviceProvider) {
  targetDiv.innerHTML = "";
  targetDiv.style.margin = "1em 0";

  const code = document.createElement("code");
  code.style.padding = "1rem";

  if (showFileMeta) {
    code.style.borderRadius = "0.3rem 0.3rem 0 0";
  } else {
    code.style.borderRadius = "0.3rem";
  }
  if (showBorder) {
    if (!isDarkStyle) {
      code.style.border = "1px solid #ddd";
    } else {
      code.style.border = "1px solid #555";
    }
  }
  code.classList.add(lang);
  if (codeText[codeText.length - 1] === "\n") {
    // First remove the ending newline
    codeText = codeText.slice(0, -1);
  }
  if (startLine > 0) {
    codeTextSplit = codeText.split("\n");
    codeText = codeTextSplit.slice(startLine - 1, endLine).join("\n");
  }
  // Then add the newline back
  codeText = codeText + "\n";
  code.textContent = codeText;
  if (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") {
    hljs.highlightBlock(code);
  }
  if (typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined" && showLineNumbers) {
    hljs.lineNumbersBlock(code, {
      singleLine: true,
      startFrom: startLine > 0 ? Number.parseInt(startLine) : 1
    });
  }

  if (showCopy) {
    const toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');

    const copyButton = document.createElement('a');
    copyButton.classList.add('copy-btn');
    if (isDarkStyle) {
      copyButton.classList.add('copy-btn-dark');
    } else {
      copyButton.classList.add('copy-btn-light');
    }
    copyButton.href = 'javascript:void(0);'
    copyButton.innerHTML = 'Copy';
    copyButton.addEventListener('click', function (e) {
      e.preventDefault();
      e.cancelBubble = true;
      copyTextToClipboard(codeText);
    });

    toolbar.appendChild(copyButton);
    targetDiv.appendChild(toolbar);
  }

  // Not use a real `pre` to avoid style being overwritten
  // Simulate a real one by using its default style
  const customPre = document.createElement("div");
  customPre.style.whiteSpace = "pre";
  customPre.style.tabSize = tabSize;
  customPre.appendChild(code);
  targetDiv.appendChild(customPre);

  if (showFileMeta) {
    const meta = document.createElement("div");
    const rawFileURLSplit = rawFileURL.split("/");
    meta.innerHTML = `<a target="_blank" href="${rawFileURL}" style="float:right">view raw</a>
<a target="_blank" href="${fileURL}">${rawFileURLSplit[rawFileURLSplit.length - 1]}</a>
delivered <span class="hide-in-phone">with ❤ </span>by <a target="_blank" href="${serviceProvider}">EmGithub</a>`;
    meta.classList.add("file-meta");
    if (!isDarkStyle) {
      meta.classList.add("file-meta-light");
      if (showBorder) {
        meta.style.border = "1px solid #ddd";
        meta.style.borderTop = "0";
      }
    } else {
      meta.classList.add("file-meta-dark");
      if (showBorder) {
        meta.style.border = "1px solid #555";
        meta.style.borderTop = "0";
      }
    }
    targetDiv.appendChild(meta);
  }
}

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text)
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('fallbackCopyTextToClipboard: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}
