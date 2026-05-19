# AI Change Log

### 2026-05-15
- Redesigned 404 page to match site theme with full navigation and tool grid (was generic Firebase default); removed AdSense script from 404 page to comply with AdSense "no primary content" policy

### 2026-05-18
- Added Text Case Converter tool (html/text-case-converter.html + js/text-case-converter.js) supporting 11 conversions (uppercase, lowercase, title, sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, alternating, inverse); diversifies site beyond image tools to capture high-volume text utility search queries; added to nav/footer on all pages, homepage tool grid, sitemap, and about page tool list

### 2026-05-18
- Fixed Image Compressor to preserve original format by default (Auto mode) and added format selector (PNG/JPEG/WebP); quality slider now hides for PNG since PNG toBlob ignores quality; added original format display and improved error handling for unsupported formats (e.g. WebP on older Safari); corrected misleading "side by side" description text that did not match the single-canvas UI

### 2026-05-19
- Completed integration of Text Case Converter across the site: updated homepage title, meta description, Open Graph tags, JSON-LD, headings, and intro text to reflect both image and text tools (was still branded as image-only); fixed 404 page header/footer navigation and tool grid which were missing the Case Converter link; corrected about page tool count from six to seven; updated sitemap lastmod dates for changed pages
