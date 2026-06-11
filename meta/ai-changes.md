# AI Change Log

### 2026-05-15
- Redesigned 404 page to match site theme with full navigation and tool grid (was generic Firebase default); removed AdSense script from 404 page to comply with AdSense "no primary content" policy

### 2026-05-18
- Added Text Case Converter tool (html/text-case-converter.html + js/text-case-converter.js) supporting 11 conversions (uppercase, lowercase, title, sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, alternating, inverse); diversifies site beyond image tools to capture high-volume text utility search queries; added to nav/footer on all pages, homepage tool grid, sitemap, and about page tool list

### 2026-05-18
- Fixed Image Compressor to preserve original format by default (Auto mode) and added format selector (PNG/JPEG/WebP); quality slider now hides for PNG since PNG toBlob ignores quality; added original format display and improved error handling for unsupported formats (e.g. WebP on older Safari); corrected misleading "side by side" description text that did not match the single-canvas UI

### 2026-05-19
- Completed integration of Text Case Converter across the site: updated homepage title, meta description, Open Graph tags, JSON-LD, headings, and intro text to reflect both image and text tools (was still branded as image-only); fixed 404 page header/footer navigation and tool grid which were missing the Case Converter link; corrected about page tool count from six to seven; updated sitemap lastmod dates for changed pages

### 2026-05-19
- Fixed critical Color Palette Extractor bug where bright colors (≥240 in any channel) produced invalid 9-digit hex codes due to quantization overflow to 256; values are now clamped to 255 so hex codes are always valid CSS. Also added RGB values alongside hex on each swatch and improved clipboard copy to include both formats with specific color feedback, making the tool more useful for designers who work in multiple color formats

### 2026-05-20
- Added Word Counter & Character Counter tool (html/word-counter.html + js/word-counter.js) with live word count, character count (with/without spaces), sentence count, paragraph count, reading time estimate, and keyword density analysis; diversifies site text tools to capture high-volume writing and SEO utility search queries; integrated across all page navigation, homepage tool grid, 404 tool grid, about page (correcting the previously inaccurate "seven tools" claim by making it true), sitemap, and updated homepage/about meta descriptions to reflect "image and text tools"

### 2026-05-21
- Added JSON Formatter & Validator tool (html/json-formatter.html + js/json-formatter.js) with format, minify, validate, sort-keys, indent options (2 spaces, 4 spaces, tab), auto-format on paste, and copy output; targets high-volume developer search queries ("json formatter", "json validator", "pretty print json"); integrated across all page navigation, homepage tool grid, 404 tool grid, about page (updated tool count from seven to eight and corrected outdated "image editing tools" / "HTML5 Canvas API" claims to accurately reflect all tool categories), sitemap, and updated homepage meta descriptions

### 2026-05-22
- Added Password Generator tool (html/password-generator.html + js/password-generator.js) with customizable length (6-64), uppercase/lowercase/numbers/symbols toggles, exclude-ambiguous-characters option, live strength indicator (Weak/Fair/Good/Strong), guaranteed inclusion of at least one character from each selected type, shuffle randomization, and copy-to-clipboard; targets extremely high-volume security search queries ("password generator", "strong password generator", "random password generator"); expands site into security tools to capture a broad new audience segment; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from eight to nine), sitemap; updated homepage title, meta description, Open Graph tags, JSON-LD, headings, and intro text to reflect "image, text & security tools"; also fixed the color-replacer.html header navigation bug where the JSON Formatter link was missing entirely

### 2026-05-23
- Added Base64 Encoder & Decoder tool (html/base64-encoder.html + js/base64-encoder.js) with text-to-Base64 encoding, Base64-to-text decoding, URL-safe Base64 toggle, file-to-Base64 encoding with data URI output, swap input/output, and copy-to-clipboard; targets high-volume developer search queries ("base64 encode", "base64 decode", "online base64 converter"); expands site into developer utilities alongside the JSON formatter; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from nine to ten), sitemap; updated homepage and about meta descriptions to reflect the expanded tool categories

### 2026-05-24
- Added URL Encoder & Decoder tool (html/url-encoder.html + js/url-encoder.js) with text-to-URL encoding and decoding, Component (encodeURIComponent) vs Full URL (encodeURI) mode toggle, auto-detect on paste, swap input/output, and copy-to-clipboard; targets extremely high-volume developer search queries ("url encoder", "url decode", "percent encode", "online url encoder"); strengthens the site's developer utility offering alongside JSON Formatter and Base64 Encoder; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from ten to eleven and added URL Encoder to the tool list), sitemap; updated homepage and about sitemap lastmod dates

### 2026-05-25
- Fixed critical security bug in Password Generator: replaced all `Math.random()` calls with `crypto.getRandomValues()` via Web Crypto API, and replaced the biased `Array.prototype.sort()` shuffle with a proper Fisher-Yates shuffle using cryptographically secure randomness. Also made the guaranteed-character logic robust against edge cases where selected character types could theoretically exceed the requested password length. This ensures generated passwords are genuinely unpredictable and worthy of the tool's "secure" branding - a real person using this for actual accounts deserves real security, not pseudo-randomness.

### 2026-05-26
- Added HTML Entity Encoder & Decoder tool (html/html-entity-encoder.html + js/html-entity-encoder.js) with named and numeric encoding modes, decode support for both named and numeric entities (decimal and hexadecimal), auto-detect on paste, swap input/output, and copy-to-clipboard; targets extremely high-volume developer and content-creator search queries ("html escape", "html encode", "html entity decode", "online html encoder"); expands the site's developer utility cluster alongside JSON Formatter, Base64 Encoder, and URL Encoder; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from eleven to twelve), sitemap; updated homepage meta description to reflect the expanded tool set

### 2026-05-27
- Added Hash Generator & File Checksum tool (html/hash-generator.html + js/hash-generator.js) with pure-JS MD5 and browser-native SHA-1/SHA-256/SHA-512 support for both text and file inputs; targets extremely high-volume security and developer search queries ("hash generator", "md5 online", "sha256 checksum", "file hash"); expands site into cryptographic utilities alongside Password Generator; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from twelve to thirteen), sitemap; updated homepage and 404 meta descriptions; also fixed missing HTML Entities navigation links in footers of password-generator.html and url-encoder.html that were overlooked in earlier integration passes

### 2026-05-28 [UI/UX polish]
- Made the header navigation horizontally scrollable on mobile instead of wrapping into 3-4 rows, which pushed all page content below the fold on small screens. This CSS-only change improves the experience on every page for mobile visitors.

### 2026-05-29 [SEO/performance]
- Added `preconnect` and `dns-prefetch` resource hints to every page (`<link rel="preconnect" href="https://www.googletagmanager.com" />`, `<link rel="preconnect" href="https://www.googlesyndication.com" crossorigin />`, `<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />`) to reduce DNS/TCP/TLS setup time for Google Analytics and AdSense, improving page load speed and Core Web Vitals across the entire site.

### 2026-05-30 [Bug fixes]
- Fixed memory leaks across all image tools (Image Compressor, Image Converter, Image Resizer, Color Palette Extractor, Color Replacer) by revoking `URL.createObjectURL()` blob URLs after the image is decoded and drawn to canvas; also fixed the Image Compressor download to revoke its temporary blob URL after the download starts, and fixed the Image Converter to use `canvas.toBlob()` with a clear error message when a browser does not support WebP export (e.g., older Safari), preventing broken "data:," downloads

### 2026-05-31 [Bug fixes]
- Fixed Image Resizer NaN display bug: when a user clears the Width or Height input (or enters an invalid value), the linked dimension field no longer shows "NaN"; the aspect-ratio calculation now validates the input with `!isNaN(val) && val > 0` before computing, and `renderPreview()` gracefully falls back to the original image dimensions for invalid or empty inputs

### 2026-06-01 [UI/UX polish]
- Completely rethought the site navigation to solve the poor tab experience on both desktop and mobile. Replaced the overwhelming horizontal row of 17 tab-like links (which wrapped into 3-4 rows on desktop and provided no scroll indication on mobile) with a compact, categorized navigation system: desktop shows 4 tool category dropdowns (Image, Text, Developer, Security) plus Home/About/Privacy/Contact, while mobile uses a hamburger menu that expands into categorized accordion sections. Added a clickable site title, keyboard-accessible dropdowns (Escape to close), and a simplified footer with just 4 links instead of 17. Applied consistently across all 18 pages with new `js/nav.js` and updated `css/styles.css`.

### 2026-06-02 [SEO/performance]
- Updated all sitemap.xml `lastmod` dates to 2026-06-02 because the 2026-06-01 navigation overhaul changed the header, footer, and meta structure on every page; search engines need accurate freshness signals to recrawl and index the updated site structure. Also fixed the homepage H2 heading to include "Developer" (was "Free Image, Text & Security Tools"), corrected the about page JSON-LD description to reflect all four tool categories, and updated the privacy page meta description to be inclusive of all tool types rather than mentioning only images.

### 2026-06-03 [Feature work]
- Added Image Cropper tool (html/image-cropper.html + js/image-cropper.js) with click-and-drag rectangular selection, full-resolution cropping via Canvas API, live dimension readout, reset selection, and instant PNG download; targets high-volume image editing search queries ("crop image online", "online image cropper", "free photo crop tool") and strengthens the site's image tool cluster alongside Resizer, Compressor, Converter, Palette Extractor, and Color Replacer; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from thirteen to fourteen), sitemap, and homepage meta descriptions to include "crop"

### 2026-06-04 [Bug fixes]
- Fixed Image Cropper bounds bug where dragging outside the image produced crop coordinates beyond the canvas edges, resulting in empty transparent areas in the downloaded output; coordinates are now clamped to [0, width] and [0, height]. Also improved mobile touch reliability by moving `touchmove` and `touchend` handlers to `window` (matching the existing mouse behaviour) so dragging continues even when the finger slides off the canvas, and added a `touchcancel` handler to prevent stuck drag states if the browser interrupts the gesture.

### 2026-06-05 [UI/UX polish]
- Styled all `input[type="range"]` sliders across the site (Image Compressor, Image Converter, Color Replacer, Password Generator) to match the brutalist design language with a bold onyx track, large 28px square thumb, and blue hover/focus/active states, replacing inconsistent default browser controls that were hard to use on mobile

### 2026-06-06 [Bug fixes]
- Fixed missing favicon reference on all 19 pages: favicon.ico existed in the repo but was never linked in any HTML `<head>`, so browsers showed a generic tab icon. Added `<link rel="icon" href="/favicon.ico" sizes="any" />` after every stylesheet link. Also added `<meta name="theme-color" content="#E6E1C5" />` for mobile browser address-bar branding, and `<meta name="twitter:card" />` / `twitter:title` / `twitter:description` tags after every Open Graph block so Twitter shares render rich previews instead of plain text links. These were oversights from previous page integrations that made the site look less professional in tabs, bookmarks, and social feeds.

### 2026-06-09 [Feature work]
- Added Text Diff tool (html/text-diff.html + js/text-diff.js) with line-by-line comparison using a longest-common-subsequence diff algorithm, fallback simple diff for very large texts, swap input, and clear functions. Targets high-volume search queries for text comparison and diff checking. Strengthens the site's Text Tools cluster alongside Case Converter and Word Counter. Integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from fourteen to fifteen), sitemap, and updated homepage meta descriptions to include "compare text versions". Also fixed 404 page meta descriptions to use "does not exist" instead of contractions and replaced em dashes with hyphens in the 404 heading and description, and updated all sitemap lastmod dates to 2026-06-09 to reflect the navigation and meta changes across every page.

### 2026-06-10 [Bug fixes]
- Fixed em dashes and en dashes in Password Generator interactive UI and body text (html/password-generator.html + js/password-generator.js): replaced `Strength: -` placeholder, `A-Z` labels, `a-z` labels, `0-9` labels, and all body text em dashes with hyphens. Also fixed em dashes in Color Palette clipboard copy (js/color-palette.js), Base64 Encoder file status (js/base64-encoder.js), and Hash Generator loading messages (js/hash-generator.js). Corrected outdated privacy page Open Graph and Twitter meta descriptions that still said "No images are uploaded or stored" instead of "No files or text are uploaded or stored" to accurately reflect the site's full tool set. Also replaced em dashes in the privacy page body text list items. These changes enforce the site's no-em-dash rule and fix factual inaccuracies discovered during the audit.

### 2026-06-10 [UI/UX polish]
- Fixed heading hierarchy in Color Replacer tool: changed `<h2>Upload Image</h2>` and `<h2>Click a Color to Replace</h2>` to `<h3>` so the document outline is correct (was jumping from h2 tool title to h2 subsections)
- Fixed hamburger menu `aria-label` in nav.js: now dynamically switches between "Open menu" and "Close menu" based on menu state, so screen reader users get accurate state information
- Added `aria-haspopup="true"` to all dropdown toggle buttons so screen readers announce that these buttons open a submenu
- Added null-guard in nav.js document click handler so removing a dropdown toggle from the DOM during page lifecycle does not throw an error
- Fixed `<main>` centering in styles.css: added `margin: 0 auto` so content is centered on wide screens instead of left-aligned
- Removed extraneous blank lines immediately after `<body>` in color-replacer.html and text-diff.html for consistent formatting across all pages

### 2026-06-11 [SEO/performance]
- Updated all sitemap.xml lastmod dates to 2026-06-11 (were still showing 2026-06-09 from the previous sitemap update); search engines need accurate freshness signals to recrawl and index the latest site changes
- Upgraded `pagead2.googlesyndication.com` from `dns-prefetch` to `preconnect` (with `crossorigin`) on all 20 pages; preconnect performs DNS + TCP + TLS handshake upfront, reducing AdSense script load latency by eliminating multiple round trips that dns-prefetch alone does not address
- Added `dns-prefetch` for `www.google-analytics.com` on all 20 pages; GA4 data collection requests go to this domain, and without any resource hint the browser must perform a fresh DNS lookup when analytics events fire
- Fixed about.html meta descriptions (`description`, `og:description`, `twitter:description`) to use hyphens instead of em dash HTML entities (`&mdash;`); em dashes in meta descriptions can cause SERP snippet truncation at unusual break points and violate the site's writing conventions
