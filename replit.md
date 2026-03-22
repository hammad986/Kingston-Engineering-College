# Kingston Engineering College Website

## Overview
A comprehensive multi-page static website for Kingston Engineering College (an autonomous institution in Tamil Nadu, India). The site serves as a digital portal covering departments, admissions, facilities, placements, and regulatory compliance (NAAC, IQAC, UGC).

## Architecture
- **Type**: Pure static HTML website (no build step required)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **External Libraries**: Font Awesome, Swiper CSS, AOS — all loaded via CDN
- **Data**: JSON files in `/data/` used by the local AI Assistant
- **Tooling**: Python scripts for content generation and maintenance (not part of the served site)

## Project Structure
- `/` — 100+ HTML pages (index.html is the homepage)
- `/assets/css/` — Global styles and animations
- `/assets/js/` — JavaScript including the AI assistant logic
- `/assets/images/` — Categorized image assets
- `/assets/pdfs/` — Documents for admissions, policies, etc.
- `/components/` — Reusable HTML fragments
- `/data/` — JSON data files (knowledge-base.json for AI assistant)
- `/departments/` — Department-specific pages
- `/pages/` — Secondary organized pages

## Running the Project
The site is served with Python's built-in HTTP server:
```
python3 -m http.server 5000 --bind 0.0.0.0
```
Workflow: "Start application" on port 5000 (webview)

## Deployment
Configured as a **static** deployment with `publicDir: "."` (root directory).
