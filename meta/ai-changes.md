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

### 2026-06-12 [UI/UX polish]
- Removed generic educational filler sections from all 15 tool pages (Image Resizer, Image Converter, Image Compressor, Color Palette, Color Replacer, Image Cropper, Text Case Converter, Word Counter, Text Diff, JSON Formatter, Base64 Encoder, URL Encoder, HTML Entity Encoder, Password Generator, Hash Generator). Each page had a bottom section (3-10 subsections) of AI-generated keyword-stuffed content (e.g., platform-specific image dimensions, format comparisons, generic design advice, why-X-matters text) that added no genuine value. The intro paragraph on each tool page already tells visitors what the tool does and how to use it. This removes thousands of words of filler, making pages load faster, scan more easily, and feel more trustworthy. Every remaining word on the tool pages now serves a purpose.

### 2026-06-13 [Feature work]
- Added UUID Generator tool (html/uuid-generator.html + js/uuid-generator.js) with randomized UUID v4 generation via `crypto.randomUUID()` with automatic fallback to `crypto.getRandomValues()`, single and bulk generation (1-100), uppercase/lowercase toggle, with/without hyphens toggle, copy individual, and copy all; targets very high-volume developer search queries ("uuid generator", "uuid v4", "generate uuid", "online uuid generator"); expands the site's developer tool cluster to five tools alongside JSON Formatter, Base64 Encoder, URL Encoder, and HTML Entity Encoder; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from fifteen to sixteen), sitemap; updated homepage meta descriptions to include "generate UUIDs"

### 2026-06-14 [Bug fixes]
- Replaced all remaining Unicode em dashes with hyphens across the site: index.html (4), hash-generator.html (2), base64-encoder.html (2), plus 6 more tool pages with 1 each (text-case-converter, word-counter, url-encoder, html-entity-encoder, image-converter, json-formatter, image-resizer). The 2026-06-10 bug fix only addressed password-generator, privacy, and JS files, missing 15 em dashes in 10 other pages. Every em dash on the site is now a plain hyphen, consistent with the site's writing conventions.

### 2026-06-16 [UI/UX polish]
- Updated homepage content to accurately represent all four tool categories instead of being image-centric: rewrote "How It Works" steps 1-2 to mention developer and security tools alongside image and text; changed "Why Use These Tools?" opening from "There are plenty of image editors out there" to "There are plenty of online tools out there"; generalized FAQ question "Are my images safe?" to "Is my data safe?" and "How is this different from other free image tools?" to "How is this different from other free online tools?" with corresponding answer updates. Updated sitemap lastmod dates to 2026-06-16 for all 20 pages.

### 2026-06-17 [Feature work]
- Added Color Converter tool (html/color-converter.html + js/color-converter.js) with bidirectional HEX, RGB, and HSL conversion, live color preview, and copy-to-clipboard for each format; targets high-volume developer and designer search queries ("hex to rgb", "color converter", "rgb to hex", "hsl converter"); expands the site's developer tool cluster to six tools alongside JSON Formatter, Base64 Encoder, URL Encoder, HTML Entity Encoder, and UUID Generator, and provides a color-focused utility that complements the existing Color Palette and Color Replacer image tools; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from sixteen to seventeen), sitemap; updated homepage and about meta descriptions to include "convert colors"

### 2026-06-18 [SEO/performance]
- Added `og:site_name` ("A Helpful Website") and `og:locale` ("en_US") meta tags to all 22 pages to enrich social media card previews; Facebook, Twitter, LinkedIn, and Slack use these properties to display the site name and language in shared link cards, improving click-through rates from social referrals
- Added `<meta name="robots" content="noindex, follow">` to 404.html to prevent search engines from accidentally indexing the 404 page (which had a self-referencing canonical and was at risk of appearing in SERPs if discovered via broken links)
- Updated sitemap.xml lastmod dates to 2026-06-18 for all 21 URLs to signal freshness after the meta tag additions

### 2026-06-19 [Bug fixes]
- Fixed about.html "Why We Built This" section which was still image-centric ("Most free online image editors", "basic image editing should be private") despite the site now offering text, developer, and security tools alongside image tools. Updated to generalize across all tool categories, matching the similar 2026-06-16 homepage update that was never applied to the about page. Also fixed double-space-hyphen formatting in the following paragraph.

### 2026-06-20 [UI/UX polish]
- Converted the contact form to AJAX submission via fetch (js/contact.js) so visitors who send a message stay on the page and see inline success/error feedback instead of being redirected to Formspree's external thank-you page. Added id="contact-form" to the form element and linked the new script. Updated sitemap lastmod for contact.html to signal the change.

### 2026-06-21 [Feature work]
- Added Markdown Editor tool (html/markdown-editor.html + js/markdown-editor.js) with live split-pane Markdown-to-HTML preview, custom parser supporting headings, bold, italic, links, images, code blocks (inline and fenced), ordered/unordered lists, blockquotes, horizontal rules, and strikethrough; includes word/character count, copy-HTML output, and clear button; no external CDN dependencies - the parser is fully self-contained so the tool works offline after page load; targets extremely high-volume developer and content-creator search queries ("markdown editor", "markdown to html", "markdown preview online", "markdown converter"); expands the site's developer tool cluster to seven tools alongside JSON Formatter, Base64 Encoder, URL Encoder, HTML Entity Encoder, UUID Generator, and Color Converter; integrated across all page navigation headers and footers, homepage tool grid (18th tool card), 404 tool grid, about page (updated tool count from seventeen to eighteen and added Markdown Editor to the tool list), sitemap; updated homepage and about meta descriptions to include "edit Markdown"

### 2026-06-22 [Bug fixes]
- Fixed Markdown Editor inline code rendering bug: the `processInline()` function applied bold and italic regex patterns before inline code regex, so markdown syntax inside backtick code spans (e.g., `` `**hello**` ``) was incorrectly rendered as HTML tags instead of literal text. The fix extracts code spans into placeholders before processing bold/italic, then restores them afterward, ensuring code content is always rendered literally.
- Fixed nav.js Escape keydown handler missing null guard on `toggle.closest('.has-dropdown')` - the existing click handler already had a null guard, but the Escape handler did not, creating an inconsistency that could throw an error if a dropdown toggle was removed from the DOM during the page lifecycle

### 2026-06-23 [UI/UX polish]
- Fixed contact form submission feedback appearing below the viewport on mobile: added `feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` after both success and error feedback is displayed in the contact form (js/contact.js). Previously, on mobile, the submit button was often at the bottom of the viewport, so the dynamically-appended success/error `<div>` appeared below the fold and the user saw only blank form fields with no confirmation that their message was sent. The scroll ensures visitors always see the response to their submission.

### 2026-06-24 [SEO/performance]
- Updated all sitemap.xml lastmod dates from 2026-06-21 to 2026-06-24 to signal freshness after the 6/22 (nav.js null guard fix), 6/23 (contact form scroll fix), and 6/24 changes; search engines need accurate dates to recrawl updated pages
- Updated privacy page "Last updated: 2026" to "Last updated: June 2026" so visitors see a specific month rather than a vague year-only date, improving trust signals for the privacy policy
- Moved `<script src="nav.js">` from the end of `<body>` to `<head>` with `defer` on all 23 pages (18 tool pages, 5 top-level pages), and moved `<script src="contact.js">` with `defer` on contact.html; both scripts use `DOMContentLoaded` listeners so defer is safe. The browser now starts downloading these scripts during HTML parsing instead of waiting until the entire body is parsed, reducing the render-blocking script execution at page load time

### 2026-06-25 [Bug fixes]
- Fixed homepage intro paragraph still claiming only image and text tools ("Our image tools use the HTML5 Canvas API... while our text tools run entirely in JavaScript") when the site now also offers developer and security tools; expanded to mention all four categories. The 2026-06-16 UI/UX polish pass updated the FAQ, How It Works, and section headings but missed the first `<p>` after the hero heading, leaving visitors with an incomplete description of the site's capabilities.
- Fixed about page intro paragraph that mentioned image, text, and developer tools but omitted security tools ("while our text and developer tools run entirely in JavaScript"); updated to reference all four categories for consistency with the rest of the about page which correctly lists all 18 tools.
- Updated sitemap lastmod for homepage and about.html to 2026-06-25 to signal freshness after content corrections.

### 2026-06-26 [UI/UX polish]
- Fixed about.html "Our Tools" paragraph tool ordering: the last four tools were listed in a different sequence (UUID Generator -> Color Converter -> Markdown Editor -> Hash Generator) than the homepage tool grid (Hash Generator -> UUID Generator -> Color Converter -> Markdown Editor), making the about page inconsistent with the homepage for visitors cross-referencing the tool list
- Fixed color-converter.html copy-feedback span missing inline `style="display:none"` (was relying on a CSS rule instead, diverging from the pattern used on all other tool pages); now consistent with the other 17 tool pages

### 2026-06-27 [Feature work]
- Added Unix Timestamp Converter tool (html/timestamp-converter.html + js/timestamp-converter.js) with live current epoch time display (updates every second), bidirectional timestamp-to-date and date-to-timestamp conversion, auto-detection of seconds vs milliseconds input, local and UTC output, Set to Now / Set to Today presets, and copy-to-clipboard for each conversion result; targets extremely high-volume developer search queries ("timestamp converter", "unix timestamp to date", "epoch converter", "unix time converter"); expands the site's developer tool cluster to eight tools alongside JSON Formatter, Base64 Encoder, URL Encoder, HTML Entity Encoder, UUID Generator, Color Converter, and Markdown Editor; integrated across all page navigation headers and footers, homepage tool grid (19th tool card), 404 tool grid, about page (updated tool count from eighteen to nineteen and added Timestamp Converter to the tool list), sitemap (added URL + updated all lastmod dates to 2026-06-27); updated homepage and about meta descriptions to include "convert timestamps"
- Fixed markdown-editor.html copy-feedback span missing inline `style="display:none"` (was relying on a CSS rule instead, diverging from the pattern used on all other tool pages, matching the same fix applied to color-converter.html on 2026-06-26)

### 2026-06-28 [SEO/performance]
- Trimmed homepage meta description from 467 characters to 154 characters (Google truncates snippets at ~155-160 chars, so the full value prop was buried below the fold of SERP snippets, reducing click-through rate from search results). Also trimmed the about page meta description from ~196 chars to 117 chars (matching the already-concise og:description). Updated sitemap.xml lastmod dates to 2026-06-28 for all 23 URLs to signal freshness.

### 2026-06-29 [UI/UX polish]
- Reordered the tool grid on the homepage, 404 page, and about page to be strictly grouped by category (Image, Text, Developer, Security) instead of the mixed ordering that had Developer tools split around Security tools. The previous ordering was a historical artifact from incremental feature additions: Developer tools (JSON Formatter, Base64, URL Encoder, HTML Entities), then Security (Password Generator, Hash Generator), then Developer tools again (UUID Generator, Color Converter, Markdown Editor, Timestamp Converter). Developer tools are now all grouped sequentially, followed by Security tools. This makes the grid scannable for visitors looking for a specific tool category. Updated about page tool list paragraph to match the new ordering, and updated sitemap lastmod dates to 2026-06-29 for all 23 pages to signal freshness.

### 2026-06-30 [Bug fixes]
- Fixed privacy page data handling descriptions which still referenced only images ("image data", "image or text") despite the site now offering text, developer, and security tools alongside image tools. Updated section heading from "Image & Text Processing" to "Data Processing" and rewrote 5 instances across 4 sections (Data Processing, Information We Collect, Third-Party Services, Data Retention) to accurately describe that no file contents, text data, or personal information is shared with any third party. Updated sitemap lastmod for privacy.html to 2026-06-30 to signal the content update.

### 2026-07-01 [Bug fixes]
- Removed unused `nowDisplay` variable in timestamp-converter.js (declared via `getElementById` but never referenced) and removed dead `#copy-feedback, #ts-feedback,` selectors from timestamp-converter.html inline CSS (those IDs do not exist in the page markup); both were copy-paste leftovers from other tool pages that introduced dead code
- Fixed extra blank line before `</main>` in image-cropper.html for consistent formatting

### 2026-07-01 [SEO/performance]
- Updated sitemap lastmod dates for timestamp-converter.html and image-cropper.html to 2026-07-01 to signal freshness after code cleanup

### 2026-07-02 [Feature work]
- Added Lorem Ipsum Generator tool (html/lorem-ipsum.html + js/lorem-ipsum.js) with configurable output by paragraphs, sentences, or words up to 100, "Start with Lorem ipsum..." option, and cryptographically secure randomness via crypto.getRandomValues(); targets high-volume search queries ("lorem ipsum generator", "placeholder text generator", "lorem ipsum text generator"); strengthens the site's text tool cluster alongside Case Converter, Word Counter, and Text Diff; integrated across all page navigation headers and footers, homepage tool grid, 404 tool grid, about page (updated tool count from nineteen to twenty and added Lorem Ipsum Generator to the tool list), sitemap (added URL + updated all lastmod dates to 2026-07-02); updated homepage and about meta descriptions to include "create placeholder text"

### 2026-07-04 [UI/UX polish]
- Added skip-to-content link (`.skip-link`) to all 25 pages: a keyboard-accessible link at the top of every page that becomes visible on Tab focus and jumps to `#main-content`, so keyboard and screen reader users no longer have to tab through the entire categorized navigation (20+ items) to reach the main content. Added corresponding CSS in styles.css.
- Fixed heading hierarchy on all 25 pages: changed `<a href="..." class="site-title"><h1>A Helpful Website</h1></a>` to `<h1><a href="..." class="site-title">A Helpful Website</a></h1>` so the site title is a proper `<h1>` element containing the link, not the reverse -- screen readers and document outline tools now correctly see `<h1>` as the top-level heading.
- Added `aria-current="page"` to active nav links via nav.js: the active page link now has `aria-current="page"` set automatically, so screen reader users hear "current page" when navigating the site, eliminating ambiguity about which page is active (previously only a CSS class was used).
- Updated all sitemap.xml lastmod dates to 2026-07-04 to signal freshness after the accessibility improvements.
