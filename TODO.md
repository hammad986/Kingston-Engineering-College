# AI Assistant Bug Fixes - TODO
Status: ✅ Approved by user (English-only keywords)

## 📋 Steps (English-Only Fixes)

### 1. **Fix Scrolling** [assets/js/ai-assistant.js + ai-assistant.html]
   - Replace requestAnimationFrame scroll with scrollIntoView() + setTimeout fallback
   - Ensure 100% reliable auto-scroll

### 2. **Robust Keyword Matching** [assets/js/ai-assistant.js]
   - Trim/enhance English keywords only (no Hindi)
   - Add variations: 'policy', 'policies info', 'college rules'
   - Improve matchesKeyword() with better logic

### 3. **Instance Isolation** [assets/js/ai-assistant.js + ai-assistant.html]
   - Rename window.aiAssistant → window.KingstonAI
   - Update all references

### 4. **Test & Verify**
   - "policies" ✅ detailed response
   - "policies pooocha" → Default (per user: ignore non-English)
   - Scrolling works every message

### 5. **Demo**
   - execute_command: start http-server → open ai-assistant.html

**Progress: ✅ 4/5** (Scrolling fixed, Keywords enhanced, Instance isolated, Fullpage updated)
