const config = {
    categories: ["General", "Geography", "History", "Society", "Polity", "Security", "Science", "Ecology", "Economy", "Essay", "Ethics", "Opinion", "Misc"],
    highlightClasses: ['highlight-1', 'highlight-2', 'highlight-3', 'highlight-4', 'highlight-5', 'highlight-6', 'highlight-7'],
    textClasses: ['text-red', 'text-green', 'text-blue', 'text-magenta', 'text-orange', 'text-teal', 'text-slate'],
    colorCycle: ['highlight-1', 'highlight-2', 'highlight-3', 'highlight-4', 'highlight-5', 'highlight-6', 'highlight-7', 'text-red', 'text-green', 'text-blue', 'text-magenta', 'text-orange', 'text-teal', 'text-slate'],
    sparkTierLimit: 100,
    sm2: {
        ratings: ['Again', 'Hard', 'Hold', 'Good', 'Easy'],
        colors: { 'Again': 'red', 'Hard': 'orange', 'Hold': 'purple', 'Good': 'skyblue', 'Easy': 'green' },
        leechThreshold: 5, // Mark a card as a leech after 5 lapses
        baseIntervals: { 'Again': 600000, 'Hard': 3600000, 'Hold': 21600000, 'Good': 43200000, 'Easy': 172800000 },
        maxReviewCount: 7
    },

    quiz: {
        cardCount: 10,
        scores: { 'Easy': 1.0, 'Good': 0.9, 'Hold': 0.7, 'Hard': 0.5, 'Again': 0.2 }
    },
    fonts: [
        // 11 Offline System Fonts (Free)
        { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
        { name: 'Cambria', value: 'Cambria, Cochin, Georgia, Times, "Times New Roman", serif' },
        { name: 'Courier New', value: "'Courier New', Courier, monospace" },
        { name: 'Garamond', value: 'Garamond, serif' },
        { name: 'Georgia', value: 'Georgia, serif' },
        { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
        { name: 'Monaco', value: 'Monaco, "Lucida Console", monospace' },
        { name: 'Palatino', value: 'Palatino, "Palatino Linotype", serif' },
        { name: 'Sans-Serif', value: 'sans-serif' },
        { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
        { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
        // 38 Google Web Fonts (Premium)
        { name: 'Allura', value: 'Allura, cursive' },
        { name: 'Arvo', value: 'Arvo, serif' },
        { name: 'Bitter', value: 'Bitter, serif' },
        { name: 'Cabin', value: 'Cabin, sans-serif' },
        { name: 'Cabin Sketch', value: "'Cabin Sketch', cursive" },
        { name: 'Changa One', value: "'Changa One', cursive" },
        { name: 'Cinzel', value: 'Cinzel, serif' },
        { name: 'Crimson Text', value: "'Crimson Text', serif" },
        { name: 'Dancing Script', value: "'Dancing Script', cursive" },
        { name: 'Exo 2', value: "'Exo 2', sans-serif" },
        { name: 'Fira Code', value: "'Fira Code', monospace" },
        { name: 'Great Vibes', value: "'Great Vibes', cursive" },
        { name: 'Inconsolata', value: 'Inconsolata, monospace' },
        { name: 'Jersey 20', value: "'Jersey 20', sans-serif" },
        { name: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
        { name: 'Kaushan Script', value: "'Kaushan Script', cursive" },
        { name: 'Lato', value: 'Lato, sans-serif' },
        { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
        { name: 'Lobster', value: 'Lobster, cursive' },
        { name: 'Merriweather', value: 'Merriweather, serif' },
        { name: 'Metal Mania', value: "'Metal Mania', cursive" },
        { name: 'Montserrat', value: 'Montserrat, sans-serif' },
        { name: 'Pacifico', value: 'Pacifico, cursive' },
        { name: 'Parisienne', value: 'Parisienne, cursive' },
        { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
        { name: 'Playfair Display', value: "'Playfair Display', serif" },
        { name: 'Protest Revolution', value: "'Protest Revolution', sans-serif" },
        { name: 'Righteous', value: 'Righteous, cursive' },
        { name: 'Roboto', value: 'Roboto, sans-serif' },
        { name: 'Rochester', value: 'Rochester, cursive' },
        { name: 'Salsa', value: 'Salsa, cursive' },
        { name: 'Satisfy', value: 'Satisfy, cursive' },
        { name: 'Sofia', value: 'Sofia, cursive' },
        { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
        { name: 'Special Elite', value: "'Special Elite', cursive" },
        { name: 'Syne Mono', value: "'Syne Mono', monospace" },
        { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
        { name: 'Vollkorn', value: 'Vollkorn, serif' },
        { name: 'Zilla Slab', value: "'Zilla Slab', serif" },
    ],
    bulletCycle: ['default', 'bullet-square', 'bullet-triangle', 'bullet-empty-circle', 'bullet-hyphen'],
    themes: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }, { id: 'sepia', name: 'Sepia' }, { id: 'custom', name: 'Create Theme' }],
    sanitizer: {
        allowedTags: ['P', 'BR', 'B', 'I', 'U', 'STRONG', 'EM', 'SPAN', 'DIV', 'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'DEL', 'IMG', 'SUB', 'SUP', 'CODE', 'PRE', 'BUTTON', 'SVG', 'POLYLINE', 'MARK', 'CANVAS', 'AUDIO', 'INPUT', 'IFRAME'],
        allowedAttributes: {
            '*': ['class', 'id', 'title', 'style', 'data-wb-id', 'data-wb-state', 'data-wb-state-id', 'data-caption-theme', 'data-caption-align', 'data-original-width', 'data-original-height', 'data-collapsible-icon', 'data-collapsed'],
            'a': ['href', 'target', 'data-link-type', 'data-link-id', 'data-article-id'],
            'span': ['data-tag-text', 'contenteditable', 'data-placeholder', 'data-tag', 'data-pdf-id', 'data-original-name', 'data-wb-id', 'data-level'],
            'mark': [],
            'canvas': ['data-chart-config', 'width', 'height', 'style'],
            'div': ['contenteditable', 'data-placeholder', 'data-state', 'data-checked', 'data-is-correct', 'data-answered', 'data-color', 'data-caption-theme', 'data-caption-align', 'data-wb-state', 'data-wb-id', 'data-wb-state-id', 'data-role', 'data-provider', 'data-embed-id', 'data-ratio', 'data-plyr-provider', 'data-plyr-embed-id', 'data-difficulty', 'data-tags', 'data-pyq', 'data-db-id'],
            'img': ['src', 'alt', 'width', 'height', 'style', 'data-original-width', 'data-original-height'],
            'td': ['colspan', 'rowspan'],
            'th': ['colspan', 'rowspan'],
            'button': ['aria-expanded', 'aria-controls', 'class', 'aria-label'],
            'svg': ['viewBox', 'class', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
            'polyline': ['points'],
            'audio': ['src', 'controls', 'preload'],
            'input': ['type', 'value', 'min', 'max', 'step', 'class', 'style', 'title'],
            'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'referrerpolicy', 'scrolling', 'style', 'class']
        }
    },
    image: {
        maxWidth: 1024,
        jpegQuality: 0.95,
        maxUploadSize: 30 * 1024 * 1024 // 30MB
    },
    stickyNoteColors: [
        'default', 'crimson', 'tangerine', 'sunflower', 'lime', 'forest', 'azure',
        'indigo', 'amethyst', 'lavender', 'fuchsia', 'blush', 'terracotta',
        'teal', 'slate', 'olive'
    ],
};

export default config;
