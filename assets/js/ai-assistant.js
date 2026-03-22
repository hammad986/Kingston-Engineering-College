/**
 * Kingston Engineering College AI Assistant
 * Rule-based guided system using local data
 */

class AIAssistant {
    constructor() {
        this.knowledgeBase = null;
        this.conversationHistory = [];
        this.lastIntent = null;
        this.init();
    }

    async init() {
        await this.loadKnowledgeBase();
        this.attachEventListeners();
        this.displayWelcomeMessage();
        this.autoFocusInput();
    }

    async loadKnowledgeBase() {
        try {
            const response = await fetch('data/knowledge-base.json');
            this.knowledgeBase = await response.json();
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            // Fallback is handled in the logic if null
        }
    }

    attachEventListeners() {
        // Handle both fullpage and widget IDs
        const sendBtns = [document.getElementById('fullpage-send'), document.getElementById('ai-send-btn')];
        const inputs = [document.getElementById('fullpage-input'), document.getElementById('ai-input')];

        sendBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.handleSendMessage(btn.id.includes('fullpage') ? 'fullpage' : 'ai'));
        });

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.handleSendMessage(input.id.includes('fullpage') ? 'fullpage' : 'ai');
                    }
                });
            }
        });

        // Quick action buttons
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.onclick = (e) => {
                const query = btn.getAttribute('data-query');
                if (query) {
                    this.setInput(query);
                    this.handleSendMessage('fullpage'); // Fullpage context
                }
            };
        });
        
        // Widget toggle logic (if exists)
        const toggle = document.querySelector('.ai-widget-toggle');
        const widget = document.getElementById('ai-widget-container');
        const close = document.getElementById('ai-widget-close');
        
        if (toggle && widget) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                widget.classList.toggle('active');
                if (widget.classList.contains('active')) {
                    const widgetInput = document.getElementById('ai-input');
                    if (widgetInput) setTimeout(() => widgetInput.focus(), 300);
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
        if (input) {
            input.value = text;
            input.focus();
        }
    }

    displayWelcomeMessage() {
        const greetingIntent = this.getIntentById('greeting');
        if (greetingIntent) {
            this.renderResponse(greetingIntent, false);
        } else {
            this.displayMessage("👋 Welcome to Kingston! How can I help you today?", 'bot');
        }
    }

    handleSendMessage(type = 'fullpage') {
        const inputId = type === 'fullpage' ? 'fullpage-input' : 'ai-input';
        const input = document.getElementById(inputId);
        if (!input) return;

        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Clear input
        input.value = '';

        // Display user message
        this.displayMessage(userMessage, 'user', true, type);

        // Process message
        this.processUserMessage(userMessage, type);
    }

    processUserMessage(message, type) {
        const normalized = message.toLowerCase().trim();

        // Check for context-aware responses
        if (this.lastIntent && ['yes', 'ok', 'okay', 'apply', 'sure'].includes(normalized)) {
            const followUp = this.handleContextualFollowUp();
            if (followUp) {
                this.renderResponse(followUp, true, type);
                return;
            }
        }

        // Detect Intent
        const intent = this.detectIntent(normalized);
        if (intent) {
            this.lastIntent = intent;
            this.renderResponse(intent, true, type);
        } else {
            this.lastIntent = null;
            this.renderFallback(type);
        }
    }

    detectIntent(message) {
        if (!this.knowledgeBase || !this.knowledgeBase.intents) return null;

        const matches = [];
        this.knowledgeBase.intents.forEach(intent => {
            let matchCount = 0;
            intent.keywords.forEach(keyword => {
                const normalizedKeyword = keyword.toLowerCase();
                if (message.includes(normalizedKeyword)) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                matches.push({ intent, matchCount });
            }
        });

        if (matches.length === 0) return null;

        matches.sort((a, b) => b.matchCount - a.matchCount);

        if (matches.length > 1 && matches[0].matchCount === matches[1].matchCount) {
            return null; 
        }

        return matches[0].intent;
    }

    handleContextualFollowUp() {
        if (this.lastIntent.id === 'admission' || this.lastIntent.id === 'fees') {
            return this.getIntentById('admission');
        }
        return null;
    }

    getIntentById(id) {
        return this.knowledgeBase.intents.find(i => i.id === id);
    }

    renderResponse(intent, animated, type = 'fullpage') {
        let html = `<strong>${intent.title}</strong><br>`;
        html += `<ul class="ai-points">`;
        intent.content_points.forEach(point => {
            html += `<li>${point}</li>`;
        });
        html += `</ul>`;

        if (intent.actions && intent.actions.length > 0) {
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

    renderFallback(type = 'fullpage') {
        const fallback = this.knowledgeBase.fallback;
        let html = `${fallback.message}<br>`;
        if (fallback.suggestions) {
            html += `<div class="ai-actions">`;
            fallback.suggestions.forEach(sug => {
                html += `<button class="ai-btn outline" onclick="window.KingstonAI.setInput('${sug.query}'); window.KingstonAI.handleSendMessage('${type}');">${sug.text}</button>`;
            });
            html += `</div>`;
        }
        this.displayMessage(html, 'bot', true, type);
    }

    displayMessage(content, sender, animated = true, type = 'fullpage') {
        const containerId = type === 'fullpage' ? 'fullpage-messages' : 'ai-messages';
        const container = document.getElementById(containerId);
        if (!container) return;

        const msgGroup = document.createElement('div');
        msgGroup.className = `ai-message-group ${sender} ${animated ? 'animate' : ''}`;

        const bubble = document.createElement('div');
        bubble.className = 'ai-message-bubble';
        bubble.innerHTML = content;

        msgGroup.appendChild(bubble);
        container.appendChild(msgGroup);

        this.scrollToLatest(container);
    }

    scrollToLatest(container) {
        if (!container) return;
        const lastMsg = container.lastElementChild;
        if (lastMsg) {
            lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.KingstonAI = new AIAssistant();
});
