import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color definitions
    DARK_BG = RGBColor(15, 23, 42)        # Slate 900
    EMERALD_DARK = RGBColor(6, 78, 59)    # Emerald 900
    BRAND_GREEN = RGBColor(22, 163, 74)   # Green 600
    ACCENT_GOLD = RGBColor(245, 158, 11)  # Amber 500
    WHITE = RGBColor(255, 255, 255)
    LIGHT_GRAY = RGBColor(241, 245, 249)  # Slate 100
    MUTED_TEXT = RGBColor(148, 163, 184)  # Slate 400
    CARD_BG = RGBColor(30, 41, 59)        # Slate 800
    CARD_BORDER = RGBColor(51, 65, 85)    # Slate 700

    blank_layout = prs.slide_layouts[6]

    def add_header(slide, title_text, category_text="QUICKPICK PLATFORM"):
        # Category tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = BRAND_GREEN

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = WHITE

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, DARK_BG)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.8), Inches(0.1))
    bar.fill.solid()
    bar.fill.fore_color.rgb = BRAND_GREEN
    bar.line.fill.background()

    # Title & Subtitle box
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.5), Inches(3.5))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = "QUICKPICK"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = WHITE

    p2 = tf1.add_paragraph()
    p2.text = "Grocery Click & Collect Platform for Local Stores"
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = BRAND_GREEN
    p2.space_before = Pt(10)

    p3 = tf1.add_paragraph()
    p3.text = "Browse Online • Bagged by Store Staff • Express 60-Second Counter Handover"
    p3.font.size = Pt(16)
    p3.font.color.rgb = MUTED_TEXT
    p3.space_before = Pt(14)

    # Footer note
    fbox = s1.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.5), Inches(0.8))
    p_foot = fbox.text_frame.paragraphs[0]
    p_foot.text = "Production Architectural Overview • React + Vite • Node.js + Express • PostgreSQL + Prisma • Socket.IO • Razorpay"
    p_foot.font.size = Pt(12)
    p_foot.font.color.rgb = ACCENT_GOLD

    # ==========================================
    # SLIDE 2: Executive Summary & Problem Solved
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, DARK_BG)
    add_header(s2, "Executive Summary: The Supermarket Dilemma", "Retail Problem & Value Proposition")

    # 3 Cards
    card_data_2 = [
        ("The Traditional Pain", "Supermarket Checkout Lines", [
            "Shoppers spend 20-30 minutes waiting in billing queues during peak hours.",
            "High supermarket cart abandonment when shoppers see long register lines.",
            "Grocery shopping feels like a time-consuming chore instead of a quick errand."
        ], RGBColor(239, 68, 68)),
        ("The Delivery Dilemma", "High Fees & Bruised Produce", [
            "3rd-party delivery apps charge heavy commissions and inflated product prices.",
            "Delivery riders often damage delicate fruits, warm cold dairy, or arrive late.",
            "Local neighborhood shops lose customer loyalty to massive dark-store aggregators."
        ], ACCENT_GOLD),
        ("The QuickPick Solution", "Neighborhood Click & Collect", [
            "Customers place orders online with zero convenience fees or markups.",
            "Experienced store associates handpick fresh harvest into sanitized bags.",
            "Customer walks straight to the express desk, scans QR pass, and leaves in 60s."
        ], BRAND_GREEN),
    ]

    for idx, (tag, title, bullets, color) in enumerate(card_data_2):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s2.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_tag = tf.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = color

        p_t = tf.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = WHITE
        p_t.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(10)

    # ==========================================
    # SLIDE 3: Core Technology Stack
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, DARK_BG)
    add_header(s3, "Full-Stack Technology Architecture", "Engineering Foundation")

    tech_categories = [
        ("Frontend Client", [
            ("React 18 & Vite 5", "High-performance SPA with instant HMR and lightweight bundle"),
            ("Tailwind CSS", "Modern responsive mobile-first grocery aesthetic with green palette"),
            ("Socket.IO Client", "Real-time updates for order status, counter calls & live toasts"),
            ("Axios & Confetti", "Configured HTTP client with JWT interceptors and UX feedback")
        ]),
        ("Backend Services", [
            ("Node.js 24 & Express 4", "Event-driven REST API server with modular controllers & routes"),
            ("Socket.IO 4 Engine", "Real-time room broadcasting for store staff and order tracking"),
            ("Zod Schema Validation", "Strict request body and query parameter validation on all routes"),
            ("Helmet & Rate Limiter", "Hardened HTTP headers, CORS control, and brute-force mitigation")
        ]),
        ("Database & Infrastructure", [
            ("Prisma ORM 5.22", "Type-safe database client with interactive atomic transactions"),
            ("PostgreSQL 16", "Normalized production models, decimal monetary fields, and enums"),
            ("Dual-Engine Architecture", "Auto-fallback to local SQLite engine for zero-dependency local runs"),
            ("Docker Multi-Stage", "Production containerization with automated schema migration script")
        ]),
    ]

    for idx, (cat_title, items) in enumerate(tech_categories):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = cat_title
        p_t.font.size = Pt(18)
        p_t.font.bold = True
        p_t.font.color.rgb = BRAND_GREEN

        for name, desc in items:
            p_n = tf.add_paragraph()
            p_n.text = f"✔ {name}"
            p_n.font.size = Pt(13)
            p_n.font.bold = True
            p_n.font.color.rgb = WHITE
            p_n.space_before = Pt(12)

            p_d = tf.add_paragraph()
            p_d.text = desc
            p_d.font.size = Pt(11)
            p_d.font.color.rgb = MUTED_TEXT

    # ==========================================
    # SLIDE 4: Customer Experience & Product Catalogue
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, DARK_BG)
    add_header(s4, "Customer Experience: The Digital Grocery Storefront", "Shopper Interface")

    cx_points = [
        ("9 Grocery Departments", "Comprehensive departmental hierarchy: Fruits, Vegetables, Dairy & Eggs, Bakery, Beverages, Snacks, Grains & Pulses, Personal Care, and Household essentials."),
        ("Dynamic Weight & Pack Variants", "Shoppers select precise portions (e.g., 250g, 500g, 1kg, 2kg) with instant dynamic recalculation of item price and unit savings."),
        ("Live Inventory Availability", "Visual stock badges ('In Stock', 'Only 3 left', 'Out of Stock') prevent ordering depleted warehouse items."),
        ("Persistent Multi-Item Cart", "Cart items persist for logged-in accounts across devices, with live subtotal calculation and ₹99 minimum order progress bar."),
        ("Product Modal Inspections", "High-resolution produce photography, nutritional descriptions, packaging details, and freshness guarantees before purchase.")
    ]

    for idx, (heading, text) in enumerate(cx_points):
        top = Inches(1.8 + idx * 0.95)
        bar = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.7), Inches(0.85))
        bar.fill.solid()
        bar.fill.fore_color.rgb = CARD_BG
        bar.line.color.rgb = CARD_BORDER

        tb = s4.shapes.add_textbox(Inches(1.0), top + Inches(0.1), Inches(11.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"✦  {heading}: "
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GOLD

        # Add description in same paragraph
        run = p.add_run()
        run.text = text
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = LIGHT_GRAY

    # ==========================================
    # SLIDE 5: Checkout & Pickup Slot Capacity System
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, DARK_BG)
    add_header(s5, "Express Checkout & Time-Slot Management", "Fulfillment Logistics")

    slot_cards = [
        ("ASAP Rapid Collection", "Prepared Immediately", [
            "Estimated preparation: 15–20 minutes.",
            "Priority queueing on the store staff preparation board.",
            "Can be toggled off by store manager during peak rush hours."
        ]),
        ("Scheduled Time Slots", "30-Minute Collection Windows", [
            "Pick a 30-minute collection slot today or tomorrow.",
            "Capacity capped (e.g. 10–12 orders/slot) to prevent counter congestion.",
            "Staff can manually close unavailable slots in one click."
        ]),
        ("Flexible Payment Options", "Online & Counter Checkout", [
            "Razorpay Checkout: UPI (GPay/PhonePe), Cards, NetBanking with server signature verification.",
            "Pay-at-Counter: Cash, UPI or Card when collecting bags.",
            "Free service: Zero convenience fees, zero delivery surcharges."
        ]),
    ]

    for idx, (title, sub, bullets) in enumerate(slot_cards):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s5.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = BRAND_GREEN

        p_s = tf.add_paragraph()
        p_s.text = sub
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = ACCENT_GOLD
        p_s.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(12)

    # ==========================================
    # SLIDE 6: Real-time Order Tracking & QR Pass
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, DARK_BG)
    add_header(s6, "Real-Time Tracking & Cryptographic QR Token", "Live Customer Handoff")

    # Step cards across the top
    steps = [
        ("PLACED", "Order Received", "Inventory atomically reserved in warehouse"),
        ("ACCEPTED", "Store Confirmed", "Ticket printed / queued in prep queue"),
        ("PREPARING", "Packing Produce", "Staff handpicks fresh produce into bags"),
        ("READY", "Waiting at Counter", "Customer notified via live Socket.IO chime"),
        ("COLLECTED", "Handover Complete", "QR scanned & converted to finalized sale"),
    ]

    for idx, (st_name, st_label, st_desc) in enumerate(steps):
        left = Inches(0.8 + idx * 2.38)
        top = Inches(1.8)
        width = Inches(2.25)
        height = Inches(2.2)

        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BRAND_GREEN if idx == 3 else CARD_BORDER

        tb = s6.shapes.add_textbox(left + Inches(0.1), top + Inches(0.1), width - Inches(0.2), height - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True

        p_num = tf.paragraphs[0]
        p_num.text = f"STEP 0{idx+1}"
        p_num.font.size = Pt(10)
        p_num.font.bold = True
        p_num.font.color.rgb = ACCENT_GOLD

        p_name = tf.add_paragraph()
        p_name.text = st_name
        p_name.font.size = Pt(14)
        p_name.font.bold = True
        p_name.font.color.rgb = WHITE
        p_name.space_before = Pt(2)

        p_desc = tf.add_paragraph()
        p_desc.text = st_desc
        p_desc.font.size = Pt(10)
        p_desc.font.color.rgb = MUTED_TEXT
        p_desc.space_before = Pt(6)

    # Bottom feature split
    qr_features = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.3), Inches(11.7), Inches(2.3))
    qr_features.fill.solid()
    qr_features.fill.fore_color.rgb = CARD_BG
    qr_features.line.color.rgb = CARD_BORDER

    tb_qr = s6.shapes.add_textbox(Inches(1.0), Inches(4.45), Inches(11.3), Inches(2.0))
    tf_qr = tb_qr.text_frame
    tf_qr.word_wrap = True

    p_qt = tf_qr.paragraphs[0]
    p_qt.text = "🔐 Cryptographic Pickup QR Pass Architecture"
    p_qt.font.size = Pt(16)
    p_qt.font.bold = True
    p_qt.font.color.rgb = ACCENT_GOLD

    points_qr = [
        "Zero PII Exposure: The QR code contains an opaque payload ({orderNumber, token, shop: 'QuickPick'}). No passwords, phone numbers, or card details are exposed.",
        "Anti-Fraud Protection: The counter scanner validates token cryptographic matches on the server. Duplicate collection attempts are instantly blocked.",
        "Automated Web Audio Chimes: Customers and staff hear pleasant audible notifications whenever order status transitions occur in real time."
    ]
    for pt in points_qr:
        p_pt = tf_qr.add_paragraph()
        p_pt.text = f"• {pt}"
        p_pt.font.size = Pt(12)
        p_pt.font.color.rgb = LIGHT_GRAY
        p_pt.space_before = Pt(6)

    # ==========================================
    # SLIDE 7: Admin Dashboard & Order Management
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, DARK_BG)
    add_header(s7, "Store Staff Operations & Fulfillment Board", "Store Associate Workflow")

    dash_cards = [
        ("Live Operational Metrics", "Real-Time Shop Dashboard", [
            "Today's Confirmed Gross Revenue.",
            "Total Order Count and Pending Prep Queue.",
            "Orders Ready for Customer Collection.",
            "Low-Stock Inventory Warnings."
        ]),
        ("Interactive Order Board", "Fulfillment Queue Management", [
            "Real-time incoming orders arrive with live sound chimes.",
            "One-click status transitions: Accept ➔ Pack ➔ Ready.",
            "Itemized bagging checklist with variant weights.",
            "Rejection & cancellation with stock release."
        ]),
        ("Store Operating Controls", "Settings & Capacity Tuning", [
            "Master emergency pause toggle for customer orders.",
            "ASAP orders toggle during heavy store rush.",
            "Store opening & closing hours configuration.",
            "GST tax rate and minimum order adjustments."
        ]),
    ]

    for idx, (title, sub, bullets) in enumerate(dash_cards):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s7.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = BRAND_GREEN

        p_s = tf.add_paragraph()
        p_s.text = sub
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = ACCENT_GOLD
        p_s.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(12)

    # ==========================================
    # SLIDE 8: Express Pickup Scanner & Fraud Prevention
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, DARK_BG)
    add_header(s8, "Express Counter QR Scanner & Handover", "60-Second Pickup Security")

    handover_steps = [
        ("1. Customer Arrives", "Walks to express desk and displays digital QR pass on mobile screen."),
        ("2. Staff Scans QR", "Scanner / tablet decodes the 16-character token and queries the backend."),
        ("3. Server Verification", "Backend verifies token match, checks that status is READY, and checks that collectedAt is null."),
        ("4. Bag Verification", "Staff verifies the on-screen item checklist against the bagged groceries."),
        ("5. Handover Confirmed", "Staff clicks 'Confirm Handover': records timestamp, logs staff ID, and marks payment paid.")
    ]

    for idx, (st_t, st_d) in enumerate(handover_steps):
        top = Inches(1.8 + idx * 0.95)
        bar = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.7), Inches(0.85))
        bar.fill.solid()
        bar.fill.fore_color.rgb = CARD_BG
        bar.line.color.rgb = CARD_BORDER

        tb = s8.shapes.add_textbox(Inches(1.0), top + Inches(0.12), Inches(11.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"Step {idx+1}: {st_t} — "
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = BRAND_GREEN

        run = p.add_run()
        run.text = st_d
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = LIGHT_GRAY

    # ==========================================
    # SLIDE 9: Inventory Management & Audit Trails
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, DARK_BG)
    add_header(s9, "Inventory Control: Stock Reservation & Auditing", "Warehouse Accuracy")

    inv_cards = [
        ("Atomic Reservation", "Preventing Overselling", [
            "Executed in Prisma $transaction blocks.",
            "Available = StockQuantity - ReservedStock.",
            "Simultaneous orders are safely queued and validated; overselling is impossible."
        ]),
        ("Automatic Stock Release", "Cancellation Protection", [
            "Customer self-cancellation releases reserved stock back to active stock.",
            "Store staff rejection releases stock with structured reason logging.",
            "Pickup slot capacity count automatically decrements on cancellation."
        ]),
        ("Complete Audit Trail", "Inventory Movement Ledger", [
            "Every change logs type: STOCK_IN, RESERVATION, SALE, RELEASE, ADJUSTMENT, LOSS.",
            "Tracks quantity, post-transaction balance, staff ID, and timestamp.",
            "Ensures complete transparency for store accounting and shrink analysis."
        ]),
    ]

    for idx, (title, sub, bullets) in enumerate(inv_cards):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s9.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = BRAND_GREEN

        p_s = tf.add_paragraph()
        p_s.text = sub
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = ACCENT_GOLD
        p_s.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(12)

    # ==========================================
    # SLIDE 10: Critical Business Logic & Security
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, DARK_BG)
    add_header(s10, "Critical Business Logic & Security Measures", "Production Defense-in-Depth")

    security_points = [
        ("Zero Trust on Frontend Prices", "Product prices, discounts, and subtotals sent by the client are strictly ignored. All item pricing is recomputed on the backend from database truth."),
        ("Idempotency Key Protection", "Every checkout sends a unique idempotency key. Network retries and accidental double-clicks return the existing order without duplicate charges or stock holds."),
        ("Server-Side Signature Validation", "Razorpay payments require cryptographic HMAC-SHA256 signature verification on the server before an order is confirmed."),
        ("Role-Based Access Control (RBAC)", "Routes enforce strict authentication and role authorization: CUSTOMER, STAFF, and ADMIN permissions."),
        ("Input Validation with Zod", "Every request body, query parameter, and route parameter is strictly parsed and sanitized using Zod schemas.")
    ]

    for idx, (heading, text) in enumerate(security_points):
        top = Inches(1.8 + idx * 0.95)
        bar = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top, Inches(11.7), Inches(0.85))
        bar.fill.solid()
        bar.fill.fore_color.rgb = CARD_BG
        bar.line.color.rgb = CARD_BORDER

        tb = s10.shapes.add_textbox(Inches(1.0), top + Inches(0.12), Inches(11.3), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"🔒 {heading}: "
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = BRAND_GREEN

        run = p.add_run()
        run.text = text
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = LIGHT_GRAY

    # ==========================================
    # SLIDE 11: Testing & Verification Results
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, DARK_BG)
    add_header(s11, "Automated Verification & Test Coverage", "Quality Assurance")

    # Big stat callout
    stat_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(3.5), Inches(4.8))
    stat_box.fill.solid()
    stat_box.fill.fore_color.rgb = EMERALD_DARK
    stat_box.line.color.rgb = BRAND_GREEN

    tb_s = s11.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(3.1), Inches(4.0))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True

    p_s1 = tf_s.paragraphs[0]
    p_s1.text = "100%"
    p_s1.font.size = Pt(56)
    p_s1.font.bold = True
    p_s1.font.color.rgb = WHITE

    p_s2 = tf_s.add_paragraph()
    p_s2.text = "TEST PASS RATE"
    p_s2.font.size = Pt(14)
    p_s2.font.bold = True
    p_s2.font.color.rgb = ACCENT_GOLD

    p_s3 = tf_s.add_paragraph()
    p_s3.text = "23 End-to-End Tests\n0 Failures • 0 Errors"
    p_s3.font.size = Pt(18)
    p_s3.font.bold = True
    p_s3.font.color.rgb = WHITE
    p_s3.space_before = Pt(14)

    # Right side 4 test suites
    suites = [
        ("Auth & RBAC Protection", "Verified customer registration, JWT token generation, admin authentication, and 403 authorization blocking on restricted routes."),
        ("Product & Search Catalogue", "Verified 9 grocery departments, search matching, filtering by category, and sorting by price/popularity."),
        ("Atomic Order Reservation", "Verified order creation, subtotal calculation, 5% GST tax computation, and immediate stock reservation."),
        ("Handover & Anti-Duplicate Fraud", "Verified staff QR token verification, handover status transition, and successful blocking of duplicate collection attempts.")
    ]

    for idx, (title, desc) in enumerate(suites):
        top = Inches(1.8 + idx * 1.2)
        card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.6), top, Inches(7.9), Inches(1.05))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s11.shapes.add_textbox(Inches(4.8), top + Inches(0.1), Inches(7.5), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"✅ {title}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = BRAND_GREEN

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = LIGHT_GRAY
        p_d.space_before = Pt(2)

    # ==========================================
    # SLIDE 12: Deployment & Roadmap
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, DARK_BG)
    add_header(s12, "Production Deployment & Future Roadmap", "Launch Strategy")

    deploy_cards = [
        ("Cloud Deployment", "Production Architecture", [
            "Frontend: Vercel edge CDN with automated CI/CD.",
            "Backend API: Render / Railway / Fly.io containerized Node.js service.",
            "Database: Managed PostgreSQL on Neon or Supabase.",
            "Docker: Complete multi-stage Dockerfile and docker-compose.yml ready."
        ]),
        ("Pre-Seeded Demo Access", "Ready for Instant Review", [
            "Admin: admin@quickpick.com / Admin@12345",
            "Staff: staff@quickpick.com / Staff@12345",
            "Customer: customer@example.com / Customer@12345",
            "One-click demo login buttons directly on the sign-in modal."
        ]),
        ("Future Roadmap", "Next Phase Features", [
            "Automated WhatsApp & SMS order notifications upon pickup readiness.",
            "Multi-counter barcode/thermal receipt printer integration (ESC/POS).",
            "Customer loyalty points & localized promotional coupons.",
            "Integration with in-store electronic shelf labels (ESLs)."
        ]),
    ]

    for idx, (title, sub, bullets) in enumerate(deploy_cards):
        left = Inches(0.8 + idx * 3.9)
        top = Inches(1.8)
        width = Inches(3.7)
        height = Inches(4.8)

        card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tb = s12.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = BRAND_GREEN

        p_s = tf.add_paragraph()
        p_s.text = sub
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = ACCENT_GOLD
        p_s.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(12)

    # Save presentation
    output_path = os.path.join(os.path.dirname(__file__), "QuickPick_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
