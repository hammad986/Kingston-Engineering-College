/**
 * Kingston Engineering College – AI Assistant v2
 * Improved: weighted scoring, context memory, search fallback,
 * typing indicator, Hindi/Hinglish support
 */

class AIAssistant {
    constructor() {
        this.knowledgeBase = null;
        this.searchIndex = null;
        this.intentMemory = [];   // last 3 intent IDs
        this.MAX_MEMORY = 3;
        this.init();
    }

    /* ── Bootstrap ───────────────────────────────────────────── */
    async init() {
        await Promise.all([
            this.loadKnowledgeBase(),
            this.loadSearchIndex()
        ]);
        this.attachEventListeners();
        this.displayWelcomeMessage();
        this.autoFocusInput();
    }

    async loadKnowledgeBase() {
        try {
            const res = await fetch('data/knowledge-base.json');
            this.knowledgeBase = await res.json();
        } catch (e) {
            console.warn('[KingstonAI] Failed to load knowledge base.', e);
        }
    }

    async loadSearchIndex() {
        try {
            const res = await fetch('data/search-index.json');
            this.searchIndex = await res.json();
        } catch (e) {
            console.warn('[KingstonAI] Failed to load search index.', e);
        }
    }

    /* ── Event listeners ─────────────────────────────────────── */
    attachEventListeners() {
        const sendBtns = [
            document.getElementById('fullpage-send'),
            document.getElementById('ai-send-btn')
        ];
        const inputs = [
            document.getElementById('fullpage-input'),
            document.getElementById('ai-input')
        ];

        sendBtns.forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                const type = btn.id.includes('fullpage') ? 'fullpage' : 'widget';
                this.handleSendMessage(type);
            });
        });

        inputs.forEach(input => {
            if (!input) return;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const type = input.id.includes('fullpage') ? 'fullpage' : 'widget';
                    this.handleSendMessage(type);
                }
            });
        });

        // Quick action buttons
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (query) {
                    this.setInput(query);
                    this.handleSendMessage('fullpage');
                }
            });
        });

        // Widget toggle
        const toggle = document.querySelector('.ai-widget-toggle');
        const widget = document.getElementById('ai-widget-container');
        const close = document.getElementById('ai-widget-close');

        if (toggle && widget) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                widget.classList.toggle('active');
                if (widget.classList.contains('active')) {
                    const input = document.getElementById('ai-input');
                    if (input) setTimeout(() => input.focus(), 300);
                }
            });
        }

        if (close && widget) {
            close.addEventListener('click', () => widget.classList.remove('active'));
        }
    }

    autoFocusInput() {
        setTimeout(() => {
            const input = document.getElementById('fullpage-input') || document.getElementById('ai-input');
            if (input) input.focus();
        }, 500);
    }

    setInput(text) {
        const input = document.getElementById('fullpage-input') || document.getElementById('ai-input');
        if (input) { input.value = text; input.focus(); }
    }

    /* ── Welcome message ─────────────────────────────────────── */
    displayWelcomeMessage() {
        const intent = this.getIntentById('greeting');
        if (intent) {
            this.renderResponse(intent, false, 'fullpage');
            this.renderResponse(intent, false, 'widget');
        } else {
            this.displayMessage("👋 Welcome to Kingston! How can I help you today?", 'bot', false, 'fullpage');
            this.displayMessage("👋 Welcome to Kingston! How can I help you today?", 'bot', false, 'widget');
        }
    }

    /* ── Message flow ────────────────────────────────────────── */
    handleSendMessage(type = 'fullpage') {
        const inputId = type === 'fullpage' ? 'fullpage-input' : 'ai-input';
        const input = document.getElementById(inputId);
        if (!input) return;

        const userMessage = input.value.trim();
        if (!userMessage) return;

        input.value = '';
        this.displayMessage(userMessage, 'user', true, type);
        this.showTypingIndicator(type);

        setTimeout(() => {
            this.hideTypingIndicator(type);
            this.processUserMessage(userMessage, type);
        }, 350 + Math.random() * 200); // 350–550ms realistic delay
    }

    processUserMessage(message, type) {
        const normalized = this.normalize(message);

        // Context-aware follow-up
        const contextResponse = this.handleContextualFollowUp(normalized);
        if (contextResponse) {
            this.recordMemory(contextResponse.id);
            this.renderResponse(contextResponse, true, type);
            return;
        }

        // Detect best intent
        const intent = this.detectIntent(normalized);
        if (intent) {
            this.recordMemory(intent.id);
            this.renderResponse(intent, true, type);
        } else {
            // Fallback: search the site index for relevant pages
            this.renderSearchFallback(normalized, type);
        }
    }

    /* ── Normalise input ─────────────────────────────────────── */
    normalize(text) {
        return text
            .toLowerCase()
            .replace(/[?!,।]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* ── Weighted Intent Detection ───────────────────────────── */
    detectIntent(message) {
        if (!this.knowledgeBase?.intents) return null;

        const scores = this.knowledgeBase.intents.map(intent => ({
            intent,
            score: this.scoreIntent(intent, message)
        })).filter(r => r.score > 0);

        if (!scores.length) return null;

        scores.sort((a, b) => b.score - a.score);
        return scores[0].intent; // always take highest – no tie failure
    }

    scoreIntent(intent, message) {
        let total = 0;
        const keywords = intent.keywords || [];

        for (const kw of keywords) {
            const k = kw.toLowerCase();

            // Exact full-phrase match (highest weight)
            if (message === k) { total += 100; continue; }

            // Contains full keyword as a phrase
            if (message.includes(k)) {
                // Bonus for longer keyword matches (more specific)
                total += 60 + k.length;
                continue;
            }

            // All words in the keyword appear in the message
            const words = k.split(/\s+/);
            if (words.length > 1 && words.every(w => message.includes(w))) {
                total += 40;
                continue;
            }

            // Single word partial / fuzzy match
            if (k.length >= 4 && message.includes(k.slice(0, Math.ceil(k.length * 0.75)))) {
                total += 15;
            }
        }

        return total;
    }

    /* ── Context memory ──────────────────────────────────────── */
    recordMemory(intentId) {
        this.intentMemory.push(intentId);
        if (this.intentMemory.length > this.MAX_MEMORY) {
            this.intentMemory.shift();
        }
    }

    handleContextualFollowUp(message) {
        const acks = ['yes', 'ok', 'okay', 'sure', 'go ahead', 'please', 'haan', 'theek hai', 'ha', 'tell me more'];
        if (!acks.includes(message)) return null;

        const last = this.intentMemory[this.intentMemory.length - 1];
        if (!last) return null;

        // Contextual follow-up mappings
        const followUp = {
            'admission': 'fees',
            'fees': 'scholarship',
            'placement': 'internship',
            'departments': 'cse',
            'cse': 'placement',
            'hostel': 'transport',
            'about': 'facilities'
        };

        const nextId = followUp[last];
        return nextId ? this.getIntentById(nextId) : null;
    }

    /* ── Search Fallback ─────────────────────────────────────── */
    renderSearchFallback(query, type) {
        const fallback = this.knowledgeBase?.fallback;
        const results = this.searchPages(query, 4);

        let html = `<p>${fallback?.message || "Here are some pages that might help:"}</p>`;

        if (results.length > 0) {
            html += `<ul class="ai-points">`;
            results.forEach(r => {
                html += `<li><a href="${r.url}" style="color:#003366;font-weight:600;">${r.title}</a><br><small style="color:#888;">${r.description}</small></li>`;
            });
            html += `</ul>`;
        }

        if (fallback?.suggestions) {
            html += `<div class="ai-actions">`;
            fallback.suggestions.forEach(sug => {
                html += `<button class="ai-btn outline" onclick="window.KingstonAI.setInput('${sug.query}'); window.KingstonAI.handleSendMessage('${type}');">${sug.text}</button>`;
            });
            html += `</div>`;
        }

        this.displayMessage(html, 'bot', true, type);
    }

    searchPages(query, limit = 4) {
        if (!this.searchIndex) return [];
        const q = query.toLowerCase();
        const words = q.split(/\s+/).filter(Boolean);

        const scored = this.searchIndex.map(entry => {
            let score = 0;
            const title = (entry.title || '').toLowerCase();
            const desc = (entry.description || '').toLowerCase();
            const kws = (entry.keywords || []).join(' ').toLowerCase();

            if (title.includes(q)) score += 60;
            if (kws.includes(q)) score += 40;
            if (desc.includes(q)) score += 20;

            words.forEach(w => {
                if (title.includes(w)) score += 10;
                if (kws.includes(w)) score += 7;
                if (desc.includes(w)) score += 3;
            });

            return { entry, score };
        }).filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(r => r.entry);

        return scored;
    }

    /* ── Render helpers ──────────────────────────────────────── */
    renderResponse(intent, animated, type = 'fullpage') {
        let html = `<strong>${intent.title}</strong>`;
        html += `<ul class="ai-points">`;
        (intent.content_points || []).forEach(point => {
            html += `<li>${point}</li>`;
        });
        html += `</ul>`;

        if (intent.actions?.length) {
            html += `<div class="ai-actions">`;
            intent.actions.forEach(action => {
                if (action.url) {
                    html += `<a href="${action.url}" class="ai-btn primary">${action.text}</a>`;
                } else if (action.query) {
                    html += `<button class="ai-btn secondary" onclick="window.KingstonAI.setInput('${action.query}'); window.KingstonAI.handleSendMessage('${type}');">${action.text}</button>`;
                }
            });
            html += `</div>`;
        }

        this.displayMessage(html, 'bot', animated, type);
    }

    getIntentById(id) {
        return this.knowledgeBase?.intents?.find(i => i.id === id) || null;
    }

    /* ── Typing indicator ────────────────────────────────────── */
    showTypingIndicator(type) {
        const containerId = type === 'fullpage' ? 'fullpage-messages' : 'ai-messages';
        const container = document.getElementById(containerId);
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'ai-message-group bot ai-typing-group';
        el.id = `typing-${type}`;
        el.innerHTML = `
            <div class="ai-bot-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="ai-message-bubble ai-typing-bubble">
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
            </div>`;
        container.appendChild(el);
        this.scrollToLatest(container);
    }

    hideTypingIndicator(type) {
        const el = document.getElementById(`typing-${type}`);
        if (el) el.remove();
    }

    /* ── Display message ─────────────────────────────────────── */
    displayMessage(content, sender, animated = true, type = 'fullpage') {
        const containerId = type === 'fullpage' ? 'fullpage-messages' : 'ai-messages';
        const container = document.getElementById(containerId);
        if (!container) return;

        const group = document.createElement('div');
        group.className = `ai-message-group ${sender}${animated ? ' animate' : ''}`;

        const bubble = document.createElement('div');
        bubble.className = 'ai-message-bubble';
        bubble.innerHTML = content;

        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'ai-bot-avatar';
            avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
            group.appendChild(avatar);
        }

        group.appendChild(bubble);
        container.appendChild(group);
        this.scrollToLatest(container);
    }

    scrollToLatest(container) {
        if (!container) return;
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 60);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.KingstonAI = new AIAssistant();
});
