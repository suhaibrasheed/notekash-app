const registry = {
  jszip: { src: 'vendor/jszip.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', globalName: 'JSZip' },
  jspdf: { src: 'vendor/jspdf.umd.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', globalName: 'jspdf' },
  html2canvas: { src: 'vendor/html2canvas.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', globalName: 'html2canvas' },
  pdfmake: { src: 'vendor/pdfmake.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js', globalName: 'pdfMake' },
  pdfmakeFonts: { src: 'vendor/vfs_fonts.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js' },
  chartjs: { src: 'vendor/chart.umd.min.js', fallback: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', globalName: 'Chart' },
  d3: { src: 'vendor/d3.v7.min.js', fallback: 'https://d3js.org/d3.v7.min.js', globalName: 'd3' },
  htmlToImage: { src: 'vendor/html-to-image.min.js', fallback: 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js', globalName: 'htmlToImage' },
  fuse: { src: 'vendor/fuse.min.js', fallback: 'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js', globalName: 'Fuse' },
  katexCss: { src: 'vendor/katex.min.css', fallback: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css', type: 'css' },
  katex: { src: 'vendor/katex.min.js', fallback: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js', globalName: 'katex' },
  katexAutoRender: { src: 'vendor/auto-render.min.js', fallback: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js', globalName: 'renderMathInElement' },
  pdfjs: { src: 'vendor/pdf.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', globalName: 'pdfjsLib' },
  mammoth: { src: 'vendor/mammoth.browser.min.js', fallback: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', globalName: 'mammoth' },
  readability: { src: 'vendor/Readability.min.js', fallback: 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.min.js', globalName: 'Readability' },
  tesseract: { src: 'vendor/tesseract.min.js', fallback: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', globalName: 'Tesseract' },
  plyrCss: { src: 'vendor/plyr.css', fallback: 'https://cdn.plyr.io/3.7.8/plyr.css', type: 'css' },
  plyr: { src: 'vendor/plyr.polyfilled.js', fallback: 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js', globalName: 'Plyr' }
};

const loaded = new Map();
const pending = new Map();

function appendCss(src) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Could not load stylesheet: ${src}`));
    document.head.appendChild(link);
  });
}

function appendScript(src, globalName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolve(globalName ? window[globalName] : true);
    script.onerror = () => reject(new Error(`Could not load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadFromSources(lib) {
  const sources = [lib.src, lib.fallback].filter(Boolean);
  let lastError;

  for (const src of sources) {
    try {
      if (lib.type === 'css') return await appendCss(src);
      return await appendScript(src, lib.globalName);
    } catch (error) {
      lastError = error;
      if (!navigator.onLine) break;
    }
  }

  throw lastError || new Error('Library load failed.');
}

export const LazyLoader = {
  registry,

  async load(name) {
    const lib = registry[name];
    if (!lib) throw new Error(`Unknown lazy library: ${name}`);
    if (loaded.has(name)) return loaded.get(name);
    if (lib.globalName && window[lib.globalName]) {
      loaded.set(name, window[lib.globalName]);
      return window[lib.globalName];
    }
    if (pending.has(name)) return pending.get(name);

    const promise = loadFromSources(lib)
      .then((value) => {
        const resolved = lib.globalName ? window[lib.globalName] : value;
        loaded.set(name, resolved);
        pending.delete(name);
        return resolved;
      })
      .catch((error) => {
        pending.delete(name);
        throw error;
      });

    pending.set(name, promise);
    return promise;
  },

  loadAll(names) {
    return Promise.all(names.map((name) => this.load(name)));
  }
};

window.NoteKashLazyLoader = LazyLoader;
