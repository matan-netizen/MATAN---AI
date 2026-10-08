# Optimi – פרומפטים לסרטון הסבר (16:9)

חבילת הפקה לסרטון ההסבר של **Optimi** – סוכן חכם לחיסכון בטוקנים וקרדיטים לסוכנויות פרסום ודיגיטל.

- **Option B** – פרומפטים לתמונות (Midjourney / DALL·E 3 / Leonardo.ai) לכל אחת מ-5 הסצנות
- **Option C** – פרומפטים לווידאו (Runway Gen-3 / Luma Dream Machine / Sora / Pika) לכל אחת מ-5 הסצנות
- **Option D** – גרסת קוד מוכנה ב-Remotion: `src/OptimiExplainer` (קומפוזיציה `OptimiExplainer`, ‏1920×1080, ‏35 שניות)

## הגדרות קבועות לכל הפרומפטים

| פרמטר | ערך |
|---|---|
| יחס תמונה | 16:9 (`--ar 16:9`) |
| סגנון | Clean 2D vector tech / soft isometric 3D, modern SaaS UI |
| Navy (בסיס) | `#0c2340` |
| Emerald (חיסכון / צמיחה) | `#00a884` |
| Royal Blue (טכנולוגיה) | `#0052cc` |
| Light Gray (רקע) | `#f4f6f9` |

**טיפים חשובים**
1. מחוללי תמונה ווידאו עדיין לא כותבים עברית טובה. **אל תבקשו מהם טקסט.** הפרומפטים כאן מבקשים "blank UI panels" ו-"no text", ואת הכיתובים (עברית, אחוזים, ההתראה בוואטסאפ) מוסיפים בעריכה – או משתמשים בגרסת ה-Remotion שכבר כוללת אותם.
2. לא לבקש לוגואים אמיתיים של ChatGPT / Claude / Midjourney – זה יוצא מעוות ויכול להיות בעייתי מבחינת סימני מסחר. במקום זה כתוב "abstract glowing AI app icons".
3. לשמירה על אחידות ב-Midjourney: אחרי שתמונה אחת יוצאת טוב, השתמשו ב-`--sref <URL>` שלה בכל שאר הסצנות (ובמידת הצורך גם `--cref` לדמויות).
4. ב-Runway / Luma הכי טוב לעבוד **Image-to-Video**: מעלים את התמונה מ-Option B כ-first frame ומדביקים את פרומפט התנועה מ-Option C.

---

## סצנה 1 – Hook ונקודת הכאב (0:00–0:08)

**קריינות:** "סוכנויות פרסום מוציאות אלפי שקלים בחודש על מנויי AI כפולים ובזבוז טוקנים. הכירו את Optimi – הסוכן החכם שמנהל, חוסך וממקסם את צריכת ה-AI בארגון שלכם בעד 40%!"

### Option B – תמונה

**1A – הכאוס (פריים פתיחה)**
```
Wide shot of a modern open-plan digital advertising agency, diverse professionals at desks with large monitors, abstract glowing AI app icons floating above their heads like holograms, several red warning pop-up panels with blank alert symbols hovering in the air, slight sense of overload and stress, clean 2D vector tech illustration with soft isometric depth, navy blue #0c2340 and royal blue #0052cc palette with alarming red accents, light gray background #f4f6f9, crisp shapes, soft shadows, no text, no logos --ar 16:9 --style raw --v 6.1
```

**1B – השינוי (פריים מעבר)**
```
Same modern advertising agency scene, a glowing emerald green #00a884 circular shield emblem with a rising arrow sweeps through the room, red warning panels dissolving into green particles, a large clean empty dashboard panel showing a downward cost graph turning green, calm and relieved atmosphere, clean 2D vector tech illustration, navy #0c2340, royal blue #0052cc, emerald #00a884, light gray #f4f6f9, no text --ar 16:9 --style raw --v 6.1
```

### Option C – וידאו
```
Slow dolly-in across a busy modern ad agency rendered as clean 2D vector animation. Glowing abstract AI app icons float and bob above the desks; red warning panels pop in one after another with a subtle shake. At the midpoint, a glowing emerald green shield with an upward arrow flies in from the right and sweeps across the frame; the red panels shatter into green particles that drift upward. The camera settles on a calm, tidy office lit in soft blue and green light. Smooth motion, corporate tech style, navy and emerald palette, no text.
```
- **Runway Gen-3:** 10s, Image-to-Video מ-1A, ‏Motion 5.
- **Luma:** First frame = 1A, ‏Last frame = 1B (Keyframes) – נותן מעבר מושלם מכאוס לסדר.

**כיתוב בעריכה:** `עד 40% חיסכון בעלויות AI` (ירוק `#00a884`)

---

## סצנה 2 – דוגמה 1: ניתוב חכם (0:08–0:15)

**קריינות:** "דוגמה ראשונה: ניתוב חכם. הקופירייטר מבקש רעיונות לפוסטים, ו-Optimi מנתבת אוטומטית למודל המשתלם והמהיר ביותר בזמן אמת."

### Option B – תמונה
```
A copywriter at a sleek desk typing into a large chat interface on a monitor, from the prompt box a glowing data stream travels into a central router node shaped like a circular hub, the router splits into three paths leading to three abstract AI model cubes of different sizes, the smallest lightweight cube is highlighted in emerald green #00a884 with the path lit up, the other two larger cubes are dimmed in gray, clean isometric 3D vector illustration, navy #0c2340 and royal blue #0052cc, light gray background #f4f6f9, minimal SaaS aesthetic, no text --ar 16:9 --style raw --v 6.1
```

### Option C – וידאו
```
Isometric tech animation. A glowing message bubble leaves a chat window on the left and travels along a fiber-optic line into a circular router hub in the center. The hub pulses and scans three branching paths toward three AI model cubes of different sizes. Two paths flicker gray and fade; the path to the smallest cube lights up bright emerald green and the bubble zooms along it. The small cube glows and a green badge-shaped panel pops up above it. Slow orbit camera, clean navy and emerald palette, smooth easing, no text.
```

**כיתובים בעריכה:** בתיבת הצ'אט – `10 רעיונות לפוסטים לפסח`; על המודל – `GPT-4o-mini`; תג – `חיסכון של 80% בעלות השאילתה`

---

## סצנה 3 – דוגמה 2: מאגר תשובות צוותי (0:15–0:22)

**קריינות:** "דוגמה שנייה: מאגר תשובות צוותי. המערכת מזהה שאילתות כפולות ומחזירה תשובות קיימות באופן מיידי באפס עלות!"

### Option B – תמונה
```
An account manager at a laptop launching a competitor analysis query, a glowing translucent knowledge vault cylinder (stacked database disks) beside the desk, a beam of light connects the query to a previously stored glowing answer card inside the vault, a faint ghosted silhouette of a teammate from the past who stored it, a lightning bolt indicating instant retrieval, clean 2D vector tech illustration, royal blue #0052cc and emerald green #00a884 highlights on navy #0c2340, light gray background, no text --ar 16:9 --style raw --v 6.1
```

### Option C – וידאו
```
Clean vector tech animation. An account manager presses enter on a laptop; a query card flies toward a glowing stacked-disk database vault. Inside the vault, cards rapidly shuffle like a card catalogue, then one card flashes emerald green as a match. The matching card shoots instantly back to the laptop screen with a quick lightning streak, and a green sparkle burst appears around a blank price tag. Snappy, satisfying motion, light gray background, navy and emerald palette, no text.
```

**כיתובים בעריכה:** `נמצאה התאמה – נשמר ע״י חבר צוות לפני שבוע`; תג – `עלות טוקנים: ‎$0.00 (חינם 100%)`

---

## סצנה 4 – דוגמה 3: שיוך עלויות והתראות וואטסאפ (0:22–0:29)

**קריינות:** "דוגמה שלישית: שליטה מלאה! שיוך עלויות מדויק לכל לקוח, והתראות בזמן אמת בוואטסאפ למניעת חריגות."

### Option B – תמונה
```
Agency manager in a bright office looking at a large wall-mounted analytics dashboard with blank bar charts and per-client cost columns, one column almost full in amber, holding a smartphone in the foreground showing a chat app notification bubble in green and a single approve button, clean isometric 3D vector style, navy #0c2340, royal blue #0052cc, emerald green #00a884 accents, light gray #f4f6f9 background, professional and in control mood, no text, no brand logos --ar 16:9 --style raw --v 6.1
```

### Option C – וידאו
```
Smooth tech UI animation. Bar charts on a large dashboard grow upward one by one in royal blue; one client's bar rises to about 80 percent and turns amber with a soft pulse. Cut to a close-up of a smartphone in a hand: a green chat notification slides down from the top and the phone vibrates gently. A thumb taps a round approve button which turns emerald green with a check-mark ripple. Calm, controlled pacing, clean navy and emerald palette, no text.
```

**כיתובים בעריכה:** עמודות – `לקוח A / לקוח B / לקוח X`; התראה – `⚠️ לקוח X הגיע ל-80% מתקציב החודש`; כפתור – `אשר הגדלת תקציב`

---

## סצנה 5 – קריאה לפעולה ולוגו (0:29–0:35)

**קריינות:** "Optimi – מקסימום AI בלי לקרוע את הכיס. הצטרפו עכשיו והתחילו לחסוך!"

### Option B – תמונה (רקע ללוגו)
```
Elegant minimal background for a logo reveal, soft light gray #f4f6f9 surface with gentle radial glow in the center, subtle flowing gradient ribbons in royal blue #0052cc and emerald green #00a884 sweeping upward from the lower left like a growth arrow, a few floating soft particles, plenty of empty space in the center for a logo, premium SaaS brand feel, no text, no logo --ar 16:9 --style raw --v 6.1
```

### Option C – וידאו
```
Elegant brand reveal background. Smooth gradient ribbons in royal blue and emerald green sweep upward from the lower left and curve into a circle in the center of the frame, leaving an empty clean light gray space. Soft particles drift slowly upward, gentle light bloom, slow push-in camera. Premium, calm, optimistic motion. Empty center for logo overlay, no text.
```

**על המסך (מוסיפים בעריכה מעל הרקע):**
- הלוגו המלא של Optimi
- `סוכן חכם לחיסכון בטוקנים וקרדיטים`
- `מקסימום AI בלי לקרוע את הכיס`

---

## Option D – גרסת Remotion (מוכנה בריפו)

הסרטון כבר בנוי בקוד ב-`src/OptimiExplainer`, עם כל הכיתובים בעברית, התגים, ההתראה בוואטסאפ והלוגו:

```console
npm run dev                                    # תצוגה מקדימה ב-Remotion Studio
npx remotion render OptimiExplainer out/optimi-explainer.mp4
```

הקריינות מוצגת כרגע ככתוביות. כשתהיה הקלטה של קריין, שמים אותה ב-`public/optimi/voiceover.mp3` ומפעילים את `VOICEOVER` ב-`src/OptimiExplainer/theme.ts`.
