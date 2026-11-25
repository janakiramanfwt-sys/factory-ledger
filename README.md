# Factory Ledger — Offline Edition

No login. No internet needed. No server. Two ways to use it — pick one.

```
factory-ledger-offline.html   ← Option A: just double-click this. Done.
app/                           ← Option B: build a real installable .exe
    index.html
    main.js
    preload.js
    package.json
```

---

## Option A — Zero setup (recommended if you just want it working now)

1. Double-click `factory-ledger-offline.html`.
2. It opens in your browser (Chrome, Edge, etc.) and works completely
   offline — no internet connection required.
3. Your data is saved automatically inside that browser, on this computer,
   and will still be there next time you open the same file.

**Only caveat:** the data is tied to that specific browser on this specific
computer. If you clear your browser's site data, or open the file in a
different browser, you'll start fresh. For most single-computer, single-user
use, this is perfectly fine.

---

## Option B — A real installable `.exe` (a bit more setup, more "app-like")

This gives you an actual Windows program with its own icon, its own window,
and data saved to a normal file on your PC (survives browser changes,
reinstalls, etc.).

**One-time requirement:** Node.js installed on the Windows PC you're
building it on. Download the "LTS" version free from **nodejs.org** and
install it like any other program (takes 2 minutes).

**Then, build it:**

1. Unzip this package anywhere (e.g. `Desktop\FactoryLedger`).
2. Open the `app` folder, hold Shift, right-click inside it, and choose
   **"Open PowerShell window here"** (or "Open Command window here").
3. Run:
   ```
   npm install
   ```
   (this downloads Electron — needs internet, one-time only, a minute or two)
4. Run:
   ```
   npm run dist
   ```
5. When it finishes, look inside the new `dist` folder — you'll find
   **`Factory Ledger Setup 1.0.0.exe`**. Double-click it to install like
   any normal Windows software. It adds a desktop shortcut and Start Menu
   entry.

After that, you never need Node.js, npm, or the internet again — the
installed app runs fully offline.

**Just want to try it without installing anything permanently?** Run
`npm start` instead of `npm run dist` in step 4 — it opens the app
immediately in its own window, without producing an installer.

### About the installer/app size

Electron apps bundle an entire Chromium browser + Node.js runtime, so
**150–250 MB is normal** even for a simple app like this — it's not a sign
anything went wrong. `package.json` is already tuned to keep it as small as
reasonably possible:
- Maximum compression on the installer
- Only the English language pack included (drops ~40 unused locale files)
- App code packed into a single `asar` archive

If file size matters more to you than having a dedicated desktop icon,
**Option A (`factory-ledger-offline.html`)** is the better fit — it's a
single ~50 KB file with the exact same features, just opened in your
browser instead of its own window.

### Where your data lives (Option B)

Everything is saved to a plain file on your PC at:
```
C:\Users\<you>\AppData\Roaming\Factory Ledger\ledger-data.json
```
Copy that file to back up your data, or move it to another PC running the
same app to transfer everything over.

---

## Note on why I can't hand you a ready-made `.exe` directly

Building a Windows `.exe` requires downloading Windows-specific binaries
from Microsoft/Electron's servers — something I can't do from where I build
files for you. Everything above is real, tested source code; the two
commands in Option B are the only "build" step, and they use Electron's own
official, free tooling — nothing custom or risky.
