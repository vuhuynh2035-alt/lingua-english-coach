import os
import re

css_path = os.path.join(os.path.dirname(__file__), "..", "src", "app", "globals.css")
page_path = os.path.join(os.path.dirname(__file__), "..", "src", "app", "page.tsx")

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Base html font size
css = css.replace("html { font-size: calc(100% * var(--font-scale, 1)); }", "html { font-size: calc(106.25% * var(--font-scale, 1)); }")

# 2. Upgrade all micro font-size declarations
font_size_map = [
    ("font-size: 0.375rem;", "font-size: 0.6875rem;"),
    ("font-size: 0.4375rem;", "font-size: 0.75rem;"),
    ("font-size: .4375rem;", "font-size: 0.75rem;"),
    ("font-size: 0.5rem;", "font-size: 0.8125rem;"),
    ("font-size: .5rem;", "font-size: 0.8125rem;"),
    ("font-size: 0.5625rem;", "font-size: 0.875rem;"),
    ("font-size: .5625rem;", "font-size: 0.875rem;"),
    ("font-size: 0.5625rem !important;", "font-size: 0.875rem !important;"),
    ("font-size: 0.625rem;", "font-size: 0.9375rem;"),
    ("font-size: .625rem;", "font-size: 0.9375rem;"),
    ("font-size: 0.6875rem;", "font-size: 1rem;"),
    ("font-size: .6875rem;", "font-size: 1rem;"),
    ("font-size: 0.75rem;", "font-size: 1.0625rem;"),
    ("font-size: .75rem;", "font-size: 1.0625rem;"),
    ("font-size: 0.8125rem;", "font-size: 1.125rem;"),
    ("font-size: .8125rem;", "font-size: 1.125rem;"),
    ("font-size: 0.875rem;", "font-size: 1.1875rem;"),
    ("font-size: .875rem;", "font-size: 1.1875rem;"),

    # font shorthands
    ("font: 500 0.4375rem var(--font-body);", "font: 500 0.75rem var(--font-body);"),
    ("font: 500 0.5625rem var(--font-body);", "font: 500 0.875rem var(--font-body);"),
    ("font: 600 0.5rem var(--font-body);", "font: 600 0.8125rem var(--font-body);"),
    ("font: 700 0.625rem var(--font-display);", "font: 700 0.9375rem var(--font-display);"),
    ("font: 700 0.6875rem var(--font-display);", "font: 700 1rem var(--font-display);"),
    ("font: 700 .8125rem var(--font-display);", "font: 700 1.125rem var(--font-display);"),
    ("font: 700 0.8125rem var(--font-display);", "font: 700 1.125rem var(--font-display);"),
    ("font: 700 0.875rem var(--font-display);", "font: 700 1.1875rem var(--font-display);"),
    ("font: 700 0.875rem/1.3 var(--font-display);", "font: 700 1.1875rem/1.3 var(--font-display);"),
    ("font: 700 0.9375rem var(--font-display);", "font: 700 1.25rem var(--font-display);"),
    ("font: 0.875rem/1.5 var(--font-body);", "font: 1rem/1.5 var(--font-body);"),
    ("font: 0.75rem/1.8 var(--font-body);", "font: 1.0625rem/1.8 var(--font-body);"),
]

for old, new in font_size_map:
    css = css.replace(old, new)

# 3. Update preview styling in CSS to match body and small
old_preview_css = """.font-scale-preview { margin: 0; padding: 12px; border: 1px solid #e1efe7; border-radius: 9px; color: #315b49; background: #f7fcf9; font-size: 1rem; line-height: 1.6; }"""
new_preview_css = """.font-scale-preview { margin: 10px 0 0; padding: 14px 16px; border: 1px solid #e1efe7; border-radius: 9px; color: #315b49; background: #f7fcf9; font-size: 1rem; line-height: 1.6; }
.font-scale-preview p { margin: 0; font-size: 1rem; }
.font-scale-preview small { font-size: 0.875rem; }"""

if old_preview_css in css:
    css = css.replace(old_preview_css, new_preview_css)

# Adjust fixed heights on send-button so text doesn't overflow
css = css.replace("height: 31px; padding: 0 11px; border: 0;", "min-height: 36px; padding: 6px 14px; border: 0;")

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Updated globals.css font sizes!")

# Now update page.tsx
with open(page_path, "r", encoding="utf-8") as f:
    page_content = f.read()

page_content = page_content.replace("\r\n", "\n")

# Allow fontScale up to 200 in localStorage loading
old_storage_check = "if (Number.isFinite(savedScale) && savedScale >= 100 && savedScale <= 150) {"
new_storage_check = "if (Number.isFinite(savedScale) && savedScale >= 100 && savedScale <= 200) {"
assert old_storage_check in page_content, "old_storage_check not found"
page_content = page_content.replace(old_storage_check, new_storage_check)

# Update font scale slider & preview block
old_slider_block = """          <div className="font-scale-control">
            <label className="settings-label" htmlFor="font-scale">Kích thước hiển thị</label>
            <output className="font-scale-value" htmlFor="font-scale">{fontScale}%</output>
            <input
              id="font-scale"
              className="font-scale-slider"
              type="range"
              min="100"
              max="150"
              step="5"
              value={fontScale}
              aria-valuetext={`${fontScale}%`}
              onChange={(event) => setFontScale(Number(event.target.value))}
            />
            <div className="font-scale-endpoints"><span>100% · Mặc định</span><span>150% · Lớn nhất</span></div>
          </div>
          <p className="font-scale-preview">Bản xem trước: Chữ lớn hơn giúp bạn học tiếng Anh thoải mái hơn.</p>
          <button type="button" className="button button-outline" onClick={() => setFontScale(125)} disabled={fontScale === 125}>
            Đặt lại cỡ chữ gợi ý (125%)
          </button>"""

new_slider_block = """          <div className="font-scale-control">
            <label className="settings-label" htmlFor="font-scale">Kích thước hiển thị</label>
            <output className="font-scale-value" htmlFor="font-scale">{fontScale}%</output>
            <input
              id="font-scale"
              className="font-scale-slider"
              type="range"
              min="100"
              max="180"
              step="5"
              value={fontScale}
              aria-valuetext={`${fontScale}%`}
              onChange={(event) => setFontScale(Number(event.target.value))}
            />
            <div className="font-scale-endpoints"><span>100% · Tiêu chuẩn</span><span>140% · Gợi ý</span><span>180% · Rất lớn</span></div>
          </div>
          <div className="font-scale-preview" aria-hidden="true">
            <p style={{ margin: "0 0 6px", fontWeight: "700" }}>Bản xem trước cỡ chữ thực tế ({fontScale}%):</p>
            <p style={{ margin: "0 0 6px" }}>“Teacher AI: Hello! Let's practice English together today.”</p>
            <small style={{ display: "block", color: "var(--theme-text, #315b49)", opacity: 0.85 }}>Cỡ chữ này được áp dụng đồng bộ ngay cho toàn bộ bài học, hội thoại cùng gia sư và giao diện.</small>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            <button type="button" className="button button-outline" onClick={() => setFontScale(100)} disabled={fontScale === 100}>
              Cỡ chuẩn (100%)
            </button>
            <button type="button" className="button button-outline" onClick={() => setFontScale(130)} disabled={fontScale === 130}>
              Cỡ to dễ đọc (130%)
            </button>
            <button type="button" className="button button-outline" onClick={() => setFontScale(160)} disabled={fontScale === 160}>
              Cỡ rất lớn (160%)
            </button>
          </div>"""

assert old_slider_block in page_content, "old_slider_block not found"
page_content = page_content.replace(old_slider_block, new_slider_block)

with open(page_path, "w", encoding="utf-8") as f:
    f.write(page_content)

print("Updated page.tsx font scale controls!")
