// Six Years of Us — games, memories and personalization.
function initAnniversary(fallbackCss) {
    'use strict';
    let config = JSON.parse(document.getElementById('site-config').textContent);
    const $ = id => document.getElementById(id);
    const symbols = ['♡', '✦', '🌹', '🦋', '🌙', '💌'];
    let matchDone = false, catchDone = false, letterOpen = false, deck = [], opened = [], pairs = 0, moves = 0, blocked = false, matchTimeout = null, catchTimer = null, playing = false, score = 0, deadline = 0;
    function render() { document.title = 'Six Years of Us ♡ — ' + config.to; $('greeting').textContent = config.greeting; $('anniversary-date').hidden = !config.date; if (config.date) {
        const d = new Date(config.date + 'T12:00:00');
        $('anniversary-date').textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } const timeline = $('timeline'); timeline.replaceChildren(); config.memories.forEach((m, i) => { const card = document.createElement('article'); card.className = 'memory'; const photo = document.createElement('div'); photo.className = 'photo'; if (m.photo) {
        const img = document.createElement('img');
        img.src = m.photo;
        img.alt = 'Our memory from year ' + (i + 1);
        img.loading = 'lazy';
        photo.append(img);
    }
    else {
        const s = document.createElement('span');
        s.className = 'photo-symbol';
        s.textContent = symbols[i];
        s.setAttribute('aria-hidden', 'true');
        photo.append(s);
    } const body = document.createElement('div'); body.className = 'memory-body'; const label = document.createElement('div'); label.className = 'eyebrow'; label.textContent = 'Year 0' + (i + 1); const h = document.createElement('h3'); h.textContent = m.title; const p = document.createElement('p'); p.textContent = m.text; body.append(label, h, p); card.append(photo, body); timeline.append(card); }); $('letter-title').textContent = 'To ' + config.to + ','; $('letter-text').textContent = config.letter; $('signature').textContent = 'With all my love,\n' + config.from; $('edit-button').hidden = !!config.giftMode; }
    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    } return a; }
    function initMatch() { clearTimeout(matchTimeout); deck = shuffle([...symbols, ...symbols]).map(s => ({ s, matched: false })); opened = []; pairs = 0; moves = 0; blocked = false; const grid = $('match-grid'); grid.replaceChildren(); deck.forEach((c, i) => { const b = document.createElement('button'); b.className = 'tile'; b.type = 'button'; b.textContent = '♡'; b.setAttribute('aria-label', 'Card ' + (i + 1) + ', face down'); b.addEventListener('click', () => flip(i)); grid.append(b); }); $('match-message').textContent = ''; updateMatch(); }
    function updateMatch() { $('match-count').textContent = pairs + ' / 6 pairs'; $('moves').textContent = moves + ' ' + (moves === 1 ? 'move' : 'moves'); [...$('match-grid').children].forEach((b, i) => { const c = deck[i], visible = c.matched || opened.includes(i); b.className = 'tile' + (c.matched ? ' matched' : visible ? ' open' : ''); b.textContent = visible ? c.s : '♡'; b.setAttribute('aria-label', 'Card ' + (i + 1) + ', ' + (visible ? c.s + (c.matched ? ', matched' : '') : 'face down')); b.setAttribute('aria-pressed', String(visible)); b.disabled = c.matched; }); }
    function flip(i) { if (blocked || deck[i].matched || opened.includes(i))
        return; opened.push(i); if (opened.length === 2) {
        moves++;
        const [a, b] = opened;
        if (deck[a].s === deck[b].s) {
            deck[a].matched = deck[b].matched = true;
            opened = [];
            pairs++;
            if (pairs === 6) {
                matchDone = true;
                $('match-message').textContent = 'Perfect match! Just like us. ♡';
                celebrate();
                unlock();
            }
        }
        else {
            blocked = true;
            matchTimeout = setTimeout(() => { opened = []; blocked = false; updateMatch(); }, 700);
        }
    } updateMatch(); }
    function positionHeart() { const f = $('field'), t = $('target'); const w = f.clientWidth, h = f.clientHeight; const x = 32 + Math.random() * Math.max(1, w - 64), y = 32 + Math.random() * Math.max(1, h - 64); t.style.left = x + 'px'; t.style.top = y + 'px'; }
    function catchUpdate() { const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); $('timer').textContent = left + 's'; if (left <= 0 && playing)
        endCatch(false); }
    function startCatch() { clearInterval(catchTimer); score = 0; playing = true; deadline = Date.now() + 25000; $('catch-count').textContent = '0 / 10 hearts'; $('timer').textContent = '25s'; $('catch-message').textContent = ''; $('field-msg').textContent = ''; $('target').hidden = false; $('start-catch').textContent = 'Restart game'; positionHeart(); catchTimer = setInterval(catchUpdate, 100); $('target').focus({ preventScroll: true }); }
    function endCatch(win) { playing = false; clearInterval(catchTimer); $('target').hidden = true; $('start-catch').textContent = 'Play again'; $('field-msg').textContent = win ? 'You caught my heart! ♥' : 'Almost! Give it another try. ♡'; $('catch-message').textContent = win ? 'Ten hearts, and they are all yours.' : 'You can try as many times as you like.'; if (win) {
        catchDone = true;
        celebrate();
        unlock();
    } $('start-catch').focus({ preventScroll: true }); }
    function catchHeart() { if (!playing)
        return; if (Date.now() >= deadline) {
        endCatch(false);
        return;
    } score++; $('catch-count').textContent = score + ' / 10 hearts'; if (score >= 10) {
        endCatch(true);
    }
    else {
        positionHeart();
    } }
    function unlock() { const n = Number(matchDone) + Number(catchDone); if (letterOpen)
        return; if (n === 2) {
        $('lock-symbol').textContent = '💌';
        $('lock-text').textContent = 'You did it! Both games are complete. Your letter is ready.';
        $('open-letter').disabled = false;
        $('open-letter').textContent = 'Open my love letter ♡';
        $('back-games').classList.add('hidden');
    }
    else if (n === 1) {
        $('lock-text').textContent = 'One game down, one to go. Your surprise is almost ready!';
    } }
    function celebrate() { if (matchMedia('(prefers-reduced-motion: reduce)').matches)
        return; for (let i = 0; i < 23; i++) {
        const s = document.createElement('span');
        s.className = 'confetti';
        s.textContent = ['♥', '✧', '♡'][i % 3];
        s.style.left = Math.random() * 100 + 'vw';
        s.style.top = '-30px';
        s.style.color = ['#f6a1b5', '#f4d7aa', '#fff6ef'][i % 3];
        s.style.animationDelay = Math.random() * .55 + 's';
        document.body.append(s);
        setTimeout(() => s.remove(), 3200);
    } }
    $('reset-match').addEventListener('click', initMatch);
    $('start-catch').addEventListener('click', startCatch);
    $('target').addEventListener('click', catchHeart);
    $('open-letter').addEventListener('click', () => { if (!matchDone || !catchDone)
        return; letterOpen = true; $('letter-paper').classList.remove('hidden'); $('letter-heading').textContent = 'Happy 6th anniversary.'; $('lock-text').textContent = 'For you, with all my heart.'; $('open-letter').classList.add('hidden'); celebrate(); $('letter-paper').focus({ preventScroll: true }); $('letter-paper').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }); });
    let pendingPhotos = [];
    let activePhotoLoads = 0;
    function openEditor() { pendingPhotos = config.memories.map(m => m.photo); $('edit-from').value = config.from; $('edit-to').value = config.to; $('edit-date').value = config.date; $('edit-greeting').value = config.greeting; $('edit-letter').value = config.letter; $('edit-status').textContent = ''; const parent = $('edit-memories'); parent.replaceChildren(); config.memories.forEach((m, i) => { const box = document.createElement('div'); box.className = 'edit-memory'; const title = document.createElement('h3'); title.textContent = 'Year ' + (i + 1); const tl = document.createElement('label'); tl.textContent = 'Memory title'; const ti = document.createElement('input'); ti.id = 'mt' + i; ti.value = m.title; ti.maxLength = 100; tl.append(ti); const dl = document.createElement('label'); dl.textContent = 'Memory description'; const ta = document.createElement('textarea'); ta.id = 'md' + i; ta.value = m.text; ta.maxLength = 600; dl.append(ta); const fl = document.createElement('label'); fl.textContent = 'Photo (optional)'; const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; const info = document.createElement('span'); info.className = 'edit-note'; info.textContent = m.photo ? 'Photo already added.' : 'No photo added.'; const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-photo'; remove.textContent = 'Remove photo'; remove.addEventListener('click', () => { pendingPhotos[i] = ''; file.value = ''; info.textContent = 'No photo added.'; }); file.addEventListener('change', async () => { if (!file.files[0])
        return; const token = file.files[0]; info.textContent = 'Preparing photo…'; activePhotoLoads++; $('export').disabled = true; try {
        const data = await resizePhoto(token);
        if (file.files[0] === token) {
            pendingPhotos[i] = data;
            info.textContent = 'Photo ready.';
        }
    }
    catch (e) {
        info.textContent = 'Unable to read photo. Try a JPG or PNG.';
    }
    finally {
        activePhotoLoads--;
        $('export').disabled = activePhotoLoads > 0;
    } }); fl.append(file, info, document.createElement('br'), remove); box.append(title, tl, dl, fl); parent.append(box); }); $('editor').showModal(); }
    function resizePhoto(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = reject; reader.onload = () => { const im = new Image(); im.onerror = reject; im.onload = () => { const scale = Math.min(1, 1200 / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * scale)); c.height = Math.max(1, Math.round(im.height * scale)); const ctx = c.getContext('2d'); ctx.fillStyle = '#fff1e7'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(im, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', .86)); }; im.src = reader.result; }; reader.readAsDataURL(file); }); }
    $('edit-button').addEventListener('click', openEditor);
    $('close-editor').addEventListener('click', () => $('editor').close());
    $('edit-form').addEventListener('submit', async (e) => { e.preventDefault(); const next = { from: $('edit-from').value.trim() || 'Your forever person', to: $('edit-to').value.trim() || 'My love', date: $('edit-date').value, greeting: $('edit-greeting').value, letter: $('edit-letter').value, memories: config.memories.map((m, i) => ({ title: $('mt' + i).value, text: $('md' + i).value, photo: pendingPhotos[i] })), giftMode: true }; if (activePhotoLoads > 0)
        return; const clone = document.documentElement.cloneNode(true); clone.querySelector('#site-config').textContent = JSON.stringify(next).replace(/</g, '\\u003c'); clone.querySelector('#timeline').replaceChildren(); clone.querySelector('#match-grid').replaceChildren(); clone.querySelector('#edit-memories').replaceChildren(); clone.querySelector('#editor').removeAttribute('open'); clone.querySelector('#letter-paper').classList.add('hidden'); clone.querySelector('#open-letter').classList.remove('hidden'); clone.querySelector('#open-letter').disabled = true; clone.querySelector('#open-letter').textContent = '🔒 Unlock my letter'; clone.querySelector('#letter-heading').textContent = 'A letter from my heart.'; clone.querySelector('#lock-symbol').textContent = '♡'; clone.querySelector('#lock-text').textContent = 'Your secret message is waiting. Finish the two games to open it.'; clone.querySelector('#back-games').classList.remove('hidden'); clone.querySelector('#target').hidden = true; clone.querySelector('#field-msg').textContent = 'Ready to catch my heart? ♡'; clone.querySelector('#start-catch').textContent = 'Start game'; clone.querySelector('#catch-count').textContent = '0 / 10 hearts'; clone.querySelector('#timer').textContent = '25s'; clone.querySelector('#catch-message').textContent = ''; clone.querySelectorAll('.confetti').forEach(x => x.remove()); await inlineGiftAssets(clone); const blob = new Blob(['<!DOCTYPE html>\n' + clone.outerHTML], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'our-sixth-anniversary.html'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); config = { ...next, giftMode: false }; render(); $('edit-status').textContent = 'Your gift website is ready! Share the downloaded HTML file or host it online.'; });
    render();
    initMatch();
    // Export a single HTML file, including its stylesheet and executable code.
    // The fallback allows the export to work even when opened via file://.
    async function inlineGiftAssets(clone) {
        let cssText = fallbackCss;
        const link = document.getElementById('site-styles');
        if (link) {
            try {
                cssText = Array.from(link.sheet.cssRules, rule => rule.cssText).join('\n');
            }
            catch (error) {
                try {
                    const response = await fetch(link.href);
                    if (response.ok)
                        cssText = await response.text();
                }
                catch (error) { /* Use the bundled offline fallback. */ }
            }
        }
        const style = clone.querySelector('#site-styles');
        if (style && style.tagName === 'LINK') {
            const inlineStyle = document.createElement('style');
            inlineStyle.id = 'site-styles';
            inlineStyle.textContent = cssText;
            style.replaceWith(inlineStyle);
        }
        const script = clone.querySelector('#site-script');
        script.removeAttribute('src');
        script.removeAttribute('defer');
        script.textContent = '(' + initAnniversary.toString() + ')(' +
            JSON.stringify(cssText).replace(/</g, '\\u003c') + ');';
    }
}
// Offline CSS backup for the single-file gift export. Edit style.css for the main site.
initAnniversary(":root{--ink:#fff6ef;--muted:#e8c9d3;--rose:#f6a1b5;--gold:#f4d7aa;--bg:#210e20;--line:#ffffff20;--panel:#ffffff08}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:radial-gradient(ellipse at 12% 8%,#663046 0,transparent 35%),radial-gradient(ellipse at 95% 40%,#55233e 0,transparent 30%),var(--bg);min-height:100vh;overflow-x:hidden}button,input,textarea{font:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid var(--gold);outline-offset:4px}a{color:inherit}h1,h2,h3,p{margin:0}h1,h2,.serif{font-family:Georgia,'Times New Roman',serif;font-weight:400}h2{font-size:clamp(2.05rem,5.8vw,3.65rem);line-height:1.12;letter-spacing:-.035em}.eyebrow{font-size:.7rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}.muted{color:var(--muted)}.wrap{max-width:1080px;margin:auto;padding:0 24px}.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:23px 0;border-bottom:1px solid var(--line)}.brand{font-family:Georgia,serif;font-size:1.15rem;letter-spacing:.06em}.nav a{text-decoration:none;font-size:.77rem;color:var(--muted)}.navlinks{display:flex;gap:20px}.hero{min-height:74vh;min-height:74svh;display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:36px;padding:65px 0 72px}.hero h1{font-size:clamp(3.7rem,9vw,7.6rem);line-height:.91;letter-spacing:-.07em;margin:20px 0 23px}.hero h1 em{color:var(--rose);font-weight:400}.hero p{max-width:490px;color:var(--muted);font-size:clamp(1rem,2.5vw,1.15rem)}.hero .date{font-size:.84rem;color:var(--gold);margin-top:17px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border:1px solid transparent;border-radius:100px;padding:13px 22px;font-weight:750;font-size:.9rem;min-height:46px;transition:transform .2s,background .2s}.btn:hover{transform:translateY(-2px)}.primary{background:var(--rose);color:#351225;box-shadow:0 9px 35px #f6a1b523}.secondary{border-color:#ffffff35;background:#ffffff08;color:var(--ink)}.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}.hero-art{position:relative;display:grid;place-items:center;min-height:330px;isolation:isolate}.orbit{width:min(86%,330px);aspect-ratio:1;border:1px solid #f4d7aa65;border-radius:50%;display:grid;place-items:center;position:relative;box-shadow:0 0 90px #f6a1b51b}.orbit:before,.orbit:after{content:'';position:absolute;border:1px solid #f4d7aa30;border-radius:50%;inset:-14px}.orbit:after{inset:13px;border-style:dashed}.heart-art{font-size:clamp(8rem,22vw,14rem);line-height:1;color:var(--rose);text-shadow:0 0 45px #f6a1b568;animation:pulse 3s ease-in-out infinite;position:relative}.spark{position:absolute;color:var(--gold);font-size:1.7rem}.spark.a{top:9%;right:9%}.spark.b{bottom:15%;left:2%}.spark.c{top:4%;left:19%;font-size:1rem}.art-caption{position:absolute;bottom:1%;letter-spacing:.18em;text-transform:uppercase;font-size:.65rem;color:var(--gold)}@keyframes pulse{50%{transform:scale(1.06)}}.section{padding:72px 0;border-top:1px solid var(--line)}.section-head{max-width:680px;margin-bottom:28px}.section-head h2{margin:10px 0 14px}.section-head p{color:var(--muted)}.timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.memory{border:1px solid var(--line);border-radius:22px;background:var(--panel);overflow:hidden;min-width:0}.photo{height:180px;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#c2687970,transparent 65%),linear-gradient(135deg,#613249,#301627);position:relative;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}.photo-symbol{font:4rem Georgia,serif;color:#f9d8d8b0}.memory-body{padding:20px}.memory h3{font:1.45rem/1.2 Georgia,serif;margin:7px 0 9px}.memory p{font-size:.9rem;color:var(--muted);overflow-wrap:anywhere}.games{display:grid;grid-template-columns:1fr 1fr;gap:18px}.game{padding:24px;border:1px solid var(--line);background:var(--panel);border-radius:24px;min-width:0}.game h3{font:1.65rem/1.2 Georgia,serif;margin:9px 0}.game p{font-size:.9rem;color:var(--muted)}.status{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:18px 0 12px;font-size:.8rem;color:var(--gold)}.match-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tile{width:100%;aspect-ratio:1;border:1px solid #ffffff25;border-radius:13px;background:#ffffff0d;color:var(--rose);font-size:clamp(1.2rem,5vw,2rem);display:grid;place-items:center;transition:background .15s,transform .15s}.tile.open,.tile.matched{background:#f6a1b524;border-color:#f6a1b56b;color:var(--ink)}.tile.matched{background:#f4d7aa1e;border-color:#f4d7aa65}.tile:hover{transform:scale(1.03)}.game-footer{margin-top:15px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.field{position:relative;height:235px;background:radial-gradient(circle at 50% 50%,#6d29435e,transparent 75%),#180a1a;border:1px solid var(--line);border-radius:17px;overflow:hidden;display:grid;place-items:center}.field-msg{text-align:center;max-width:85%;color:var(--muted);font-size:.92rem;pointer-events:none}.target{position:absolute;display:grid;place-items:center;width:56px;height:56px;border-radius:50%;border:1px solid #ffbacc99;background:#8d345b;color:#ffcedb;font-size:31px;line-height:1;box-shadow:0 0 22px #ff8cad55;transform:translate(-50%,-50%);touch-action:manipulation}.target[hidden]{display:none}.letter-wrap{text-align:center;padding:56px 26px;border:1px solid #f4d7aa45;border-radius:32px;background:radial-gradient(ellipse at top,#6a31464f,transparent 75%),#ffffff07;position:relative;overflow:hidden}.letter-wrap h2{margin:12px 0 16px}.letter-wrap p{max-width:580px;margin:0 auto;color:var(--muted)}.lock-symbol{font-size:3rem;color:var(--gold)}.letter-wrap .actions{justify-content:center}.letter-paper{background:#fff1e7;color:#52263a;border-radius:12px;padding:clamp(25px,6vw,55px);max-width:660px;margin:25px auto 0;text-align:left;box-shadow:0 15px 55px #0004;overflow-wrap:anywhere}.letter-paper h3{font:2rem Georgia,serif;margin-bottom:15px}.letter-paper p{color:#52263a;white-space:pre-wrap;margin:0;line-height:1.85}.letter-paper .signature{margin-top:20px;font-family:Georgia,serif;font-style:italic;color:#a24366}.hidden{display:none!important}.footer{padding:28px 0 35px;display:flex;align-items:center;justify-content:space-between;gap:15px;color:var(--muted);font-size:.77rem;border-top:1px solid var(--line)}.edit-link{background:none;border:0;color:var(--muted);text-decoration:underline;text-underline-offset:3px;font-size:.76rem;padding:5px}.confetti{position:fixed;pointer-events:none;z-index:10;animation:fall 2.5s ease-in forwards;font-size:20px}@keyframes fall{from{transform:translateY(-10vh) rotate(0);opacity:1}to{transform:translateY(110vh) rotate(360deg);opacity:0}}dialog{color:var(--ink);background:#32192e;border:1px solid #ffffff35;border-radius:20px;padding:24px;width:min(700px,calc(100% - 24px));max-height:90vh;overflow:auto;box-shadow:0 20px 80px #0009}dialog::backdrop{background:#100711bd}dialog h2{font-size:2rem;margin-bottom:10px}dialog label{display:block;color:var(--gold);font-size:.82rem;margin-top:15px}dialog input:not([type=file]),dialog textarea{width:100%;margin-top:5px;border:1px solid #ffffff30;background:#ffffff0b;color:var(--ink);padding:10px 12px;border-radius:9px}dialog input[type=file]{display:block;max-width:100%;color:var(--muted);margin:7px 0;font-size:.82rem}dialog textarea{resize:vertical;min-height:90px}.edit-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.edit-memory{border-top:1px solid var(--line);margin-top:20px;padding-top:12px}.edit-memory h3{font-size:1rem}.edit-note{font-size:.85rem;color:var(--muted)}.remove-photo{border:0;color:var(--rose);background:none;padding:0;font-size:.78rem;text-decoration:underline}.game-message{color:var(--gold)!important;min-height:1.6em;margin-top:9px}.small{font-size:.77rem!important}.celebrate{color:var(--gold)}@media(max-width:740px){.wrap{padding:0 19px}.nav{padding:18px 0}.navlinks{gap:12px}.nav a{font-size:.72rem}.hero{grid-template-columns:1fr;min-height:auto;gap:15px;padding:50px 0 30px;text-align:center}.hero p{margin:auto}.hero .actions{justify-content:center}.hero-art{min-height:260px}.orbit{width:220px}.heart-art{font-size:9rem}.section{padding:48px 0}.timeline{grid-template-columns:repeat(2,1fr);gap:12px}.photo{height:132px}.memory-body{padding:15px}.memory h3{font-size:1.25rem}.games{grid-template-columns:1fr}.game{padding:20px}.letter-wrap{padding:40px 18px}.footer{flex-wrap:wrap}}@media(max-width:380px){.navlinks{gap:8px}.brand{font-size:1rem}.wrap{padding:0 14px}.timeline{grid-template-columns:1fr}.photo{height:180px}.edit-row{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;scroll-behavior:auto!important;transition:none!important}.confetti{display:none}}");
