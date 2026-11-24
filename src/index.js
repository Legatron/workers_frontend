import './styles.css';

const widget     = document.getElementById('widget');
const skeletonEl = document.getElementById('skeleton');
const newsEl     = document.getElementById('news');
const refreshBtn = document.getElementById('refresh');

const API_URL = __API_URL__;
const MIN_LOADING_MS = 1200;

function renderNews(items) {
    newsEl.innerHTML = items.map(({ title, text, avatar }) => `
        <div class="news__item">
            <img class="news__avatar" src="${avatar}" alt="">
            <div>
                <div class="news__title">${title}</div>
                <div class="news__text">${text}</div>
            </div>
        </div>
    `).join('');
}

function setState(state) {
    widget.classList.toggle('is-error', state === 'error');
    skeletonEl.style.display = state === 'loading' ? 'block' : 'none';
    newsEl.style.display     = state === 'success' ? 'block' : 'none';
}

async function loadNews() {
    setState('loading');
    const start = Date.now();

    try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();

        const elapsed = Date.now() - start;
        if (elapsed < MIN_LOADING_MS) {
            await new Promise(r => setTimeout(r, MIN_LOADING_MS - elapsed));
        }

        renderNews(data);
        setState('success');
    } catch (err) {
        const elapsed = Date.now() - start;
        if (elapsed < MIN_LOADING_MS) {
            await new Promise(r => setTimeout(r, MIN_LOADING_MS - elapsed));
        }
        setState('error');
    }
}

refreshBtn.addEventListener('click', loadNews);
loadNews();

// SW только в продакшене
if (__IS_PROD__ && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(reg => console.log('SW:', reg.scope))
            .catch(err => console.error('SW failed:', err));
    });
}