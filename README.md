# My Portfolio

Personal portfolio site for Emad Hamza Al-Qudah, a Full-Stack AI Engineer.

## Structure

```
My Portfolio/
├── index.html
├── projects.html
├── experience.html
├── certifications.html
├── skills.html
├── assets/
│   ├── css/
│   │   ├── base.css        → variables, reset, typography, buttons, utilities
│   │   ├── layout.css      → navbar, footer, page shell, responsive rules
│   │   └── pages.css       → hero, waveform, info cards, subpage components
│   ├── js/
│   │   ├── theme.js        → dark/light toggle
│   │   └── nav.js          → dropdown open/close logic (+ hero waveform init)
│   └── img/                → static images (empty for now)
├── .gitignore
└── README.md
```

## Notes

- Static site: plain HTML, CSS, and vanilla JS. No frameworks, no npm packages, no build step.
- All paths are relative, so the site works both opened directly from disk and when deployed (e.g. to Vercel).
- The navbar and footer markup is duplicated across all five HTML pages by design (no templating layer) — each copy is marked with an HTML comment noting it must be kept in sync.
