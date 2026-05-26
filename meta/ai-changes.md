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
- Fixed critical security bug in Password Generator: replaced all `Math.random()` calls with `crypto.getRandomValues()` via Web Crypto API, and replaced the biased `Array.prototype.sort()` shuffle with a proper Fisher-Yates shuffle using cryptographically secure randomness. Also made the guaranteed-character logic robust against edge cases where selected character types could theoretically exceed the requested password length. This ensures generated passwords are genuinely unpredictable and worthy of the tool's "secure" branding — a real person using this for actual accounts deserves real security, not pseudo-randomness.

### 2026-05-26
- Added HTML Entity Encoder & Decoder tool (html/html-entity-encoder.html + js/html-entity-encoder.js) with named and numeric encoding modes, decode support for both named and numeric entities (decimal and hexadecimal), auto-detect on paste, swap input/output, and copy-to-clipboard; targets extremely high-volume developer and content-creator search queries ("html escape", "html encode", "html entity decode", "online html encoder"); expands the site's developer utility cluster alongside JSON Formatter, Base64 Encoder, and URL Encoder; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from eleven to twelve), sitemap; updated homepage meta description to reflect the expanded tool set
