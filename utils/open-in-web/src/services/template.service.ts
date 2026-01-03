import path from "path";
import { readFileContent } from "./file.service";

const TEMPLATE_PATH = path.join(import.meta.dir, "..", "templates", "base.html");
const STYLE_PATH = path.join(import.meta.dir, "..", "templates", "style.css");

export interface TemplateData {
	title: string;
	content: string;
	head?: string;
	body?: string;
	isExport?: boolean;
	useMermaid?: boolean;
	useMath?: boolean;
}

const liveReloadScript = `
<script>
    const ws = new WebSocket('ws://' + window.location.host + '/ws');
    ws.onmessage = function(event) {
        if (event.data === 'reload') {
            window.location.reload();
        }
    };
    ws.onclose = function() {
        console.log('Live reload connection closed. Please refresh manually if needed.');
    }
</script>
`;

const themeToggleScript = `
<script>
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
</script>
`;

const mathjaxScript = `
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
`;

const searchScript = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchPrev = document.getElementById('search-prev');
    const searchNext = document.getElementById('search-next');
    const searchCount = document.getElementById('search-count');
    const content = document.getElementById('content');
    let matches = [];
    let currentIndex = -1;

    function removeHighlights() {
        const highlights = content.querySelectorAll('mark.highlight');
        highlights.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    function performSearch() {
        removeHighlights();
        const query = searchInput.value;
        if (query.length < 2) {
            matches = [];
            currentIndex = -1;
            updateCount();
            return;
        }

        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const regex = new RegExp(query, 'gi');
        while (node = walker.nextNode()) {
            const text = node.textContent;
            let match;
            let lastIndex = 0;
            const fragment = document.createDocumentFragment();

            while ((match = regex.exec(text)) !== null) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                const mark = document.createElement('mark');
                mark.className = 'highlight';
                mark.textContent = match[0];
                fragment.appendChild(mark);
                lastIndex = regex.lastIndex;
            }
            if (lastIndex > 0) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                node.parentNode.replaceChild(fragment, node);
            }
        }
        matches = Array.from(content.querySelectorAll('mark.highlight'));
        currentIndex = matches.length > 0 ? 0 : -1;
        navigateToCurrent();
        updateCount();
    }

    function navigateToCurrent() {
        matches.forEach((match, index) => {
            match.classList.toggle('active', index === currentIndex);
        });
        if (currentIndex !== -1) {
            matches[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function updateCount() {
        searchCount.textContent = matches.length > 0 ? (currentIndex + 1) + '/' + matches.length : '0/0';
    }

    searchInput.addEventListener('input', performSearch);
    searchNext.addEventListener('click', () => {
        if (matches.length > 0) {
            currentIndex = (currentIndex + 1) % matches.length;
            navigateToCurrent();
            updateCount();
        }
    });
    searchPrev.addEventListener('click', () => {
        if (matches.length > 0) {
            currentIndex = (currentIndex - 1 + matches.length) % matches.length;
            navigateToCurrent();
            updateCount();
        }
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchNext.click();
        }
    });
});
</script>
`;

const mermaidScript = `
<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
</script>
`;

export async function renderTemplate(data: TemplateData): Promise<string> {
	const [template, styleContent] = await Promise.all([
		readFileContent(TEMPLATE_PATH),
		readFileContent(STYLE_PATH),
	]);

	let headContent = `<style>${styleContent}</style>${data.head ?? ""}`;
	if (data.useMermaid) {
		headContent += mermaidScript;
	}
	if (data.useMath) {
		headContent += mathjaxScript;
	}

	const bodyContent = `${data.body ?? ""}${themeToggleScript}${searchScript}${data.isExport ? "" : liveReloadScript}`;

	return template
		.replace("{{title}}", data.title)
		.replace("{{content}}", data.content)
		.replace("</head>", `${headContent}</head>`)
		.replace("</body>", `${bodyContent}</body>`);
}
