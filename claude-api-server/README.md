# שרת API ל-Claude

שרת קטן שמקבל טקסט ממערכות אחרות (CRM, Make, Zapier, אתר) ומחזיר את התשובה של Claude.

## הפעלה

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-...  SERVER_TOKEN=סוד-ארוך-משלך  npm start
```

| משתנה | חובה | תיאור |
|---|---|---|
| `ANTHROPIC_API_KEY` | כן | מפתח מ-console.anthropic.com → API Keys |
| `SERVER_TOKEN` | כן | סיסמה שאתה בוחר; רק מי שמחזיק בה יכול לקרוא לשרת |
| `PORT` | לא | ברירת מחדל 3000 |
| `CLAUDE_MODEL` | לא | ברירת מחדל `claude-opus-5-5` |
| `CLAUDE_EFFORT` | לא | `low` / `medium` / `high` (ברירת מחדל `medium`) |
| `CLAUDE_SYSTEM` | לא | הוראות קבועות ל-Claude (ברירת מחדל: לענות בעברית בקצרה) |

## שימוש

```bash
curl -X POST http://localhost:3000/ask \
  -H "Authorization: Bearer סוד-ארוך-משלך" \
  -H "Content-Type: application/json" \
  -d '{"message": "כתוב כותרת למודעה על הגרלת דירה בירושלים"}'
```

תשובה:

```json
{ "answer": "...", "model": "claude-opus-5-5", "usage": { ... } }
```

אפשר גם לשלוח `system` (הוראות לבקשה הזו בלבד) ו-`history` (שיחה קודמת: `[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]`).

`GET /health` מחזיר `{"ok": true}` לבדיקת זמינות.

## קודי שגיאה

| קוד | משמעות |
|---|---|
| 400 | הבקשה לא תקינה (חסר `message`, JSON שבור) |
| 401 | `SERVER_TOKEN` חסר או שגוי |
| 422 | Claude סירב לבקשה |
| 429 | עומס – לנסות שוב בעוד רגע |
| 500 / 502 | בעיה במפתח או בחיבור ל-Claude |
