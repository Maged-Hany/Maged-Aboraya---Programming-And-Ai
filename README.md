# Maged Aboraya — Programming & AI Curriculum Platform

An interactive, high-performance web learning platform built for the Grade 11 Baccalaureate Programming & Artificial Intelligence curriculum, developed by **Maged Aboraya**.

---

## Overview

This platform transforms the traditional textbook curriculum into an engaging digital experience. It features:

- **Bilingual Stream Support:** Full Arabic curriculum alongside an English curriculum with an optional companion Arabic translation.
- **Interactive Labs & Simulators:**
  - Moore's Law Transistor Scaling Simulator
  - Caesar Cipher Wheel & Cryptanalysis Lab
  - Password Entropy & Brute-Force Calculator
  - Live HTTP Client/Server Request Simulator
  - Live HTML/CSS/JS Sandbox
  - WCAG Color Contrast & Accessibility Checker
- **48 Historical & Technical Photographs:** High-resolution galleries with interactive Lightbox zoom modals covering computing pioneers and hardware.
- **Smart Text-to-Speech (TTS):** Native dual-language audio reading engine with variable playback speeds.
- **Spotlight Search (Ctrl + K):** Instant search across all 14 lessons, key terms, pioneers, and interactive labs.
- **Developer Dark Mode:** Native high-contrast dark theme designed for comfortable study.
- **Post-Lesson Assessments:** Interactive quizzes (MCQ, True/False, Matching) with instant feedback and progress persistence.

---

## Structure

```
├── index.html              # Main application shell
├── server.js               # Node.js static HTTP server with zero-cache headers
├── package.json            # Project manifest and start script
├── assets/
│   ├── css/
│   │   └── styles.css      # Design system, typography, and dark mode
│   ├── js/
│   │   ├── core.js         # State management, TTS engine, search index, i18n
│   │   ├── app.js          # Routing, layout, header, footer, hero particle field
│   │   ├── blocks.js       # Lesson block renderers (cards, compare, steps, callouts)
│   │   ├── demos.js        # Interactive simulations and playgrounds
│   │   └── quiz.js         # Assessment engine with instant scoring
│   ├── vendor/             # React, GSAP, ScrollTrigger, Lenis smooth scroll
│   └── img/
│       └── lessons/        # 48 verified hardware and pioneer photographs
└── data/
    ├── meta.json           # Curriculum outline, chapters, and lesson metadata
    └── lessons/
        ├── ar/             # Complete Arabic lessons (1-1 to 4-4)
        └── en/             # Complete English lessons (1-1 to 4-4)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)

### Running Locally

```bash
# Start the local server
npm start

# Or directly with Node:
node server.js
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Copyright

© 2026 Maged Aboraya. All rights reserved.

