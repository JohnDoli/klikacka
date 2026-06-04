# CAPTCHA Clicker.exe

Idle/clicker hra inspirovaná reCAPTCHA, postavená na Vue 3 + TypeScript + Pinia.

---

## Implementované funkcionality

### 🎵 Hudba & zvukové efekty
- **Střídání hudby na pozadí** — dva tracky (`background-music.mp3` a `background-music2.mp3`) se automaticky střídají; po dohrání prvního se spustí druhý a naopak
- **Zvuk při koupi upgradu** — `buy.mp3` se přehraje při každém úspěšném nákupu v obchodě
- **Zvuk při vyřešení captchy** — `correct.mp3` se přehraje při správném kliknutí (včetně zlaté captchy)
- **Zvuk při odemčení achievementu** — `yeey.mp3` se přehraje ihned po odemčení
- **Autoplay ochrana** — hudba se spustí až po prvním kliku nebo stisku klávesy (vyžadováno prohlížeči)

---

### ✨ Animace
- **Flash při vyřešení captchy** — captcha box se krátce zvětší a září zeleně
- **Pulzování kupitelných upgradů** — upgrady, které si hráč může dovolit, jemně pulzují zeleným rámečkem
- **Pop animace achievementů** — nově odemčené achievementy se zobrazí s efektem přiblížení
- **Třesení image captchy** — při špatné odpovědi se dialog zatřese horizontálně
- **Zlatá captcha záře** — zlatá captcha pulzuje zlatým glow efektem
- **Vypnutí animací** — vše lze deaktivovat v nastavení

---

### ⚙️ Nastavení aplikace
- **Hlasitost hudby** — slider 0–100 %, aplikuje se okamžitě
- **Hlasitost zvukových efektů** — slider 0–100 % pro všechny SFX
- **Vypnutí animací** — toggle přepínač deaktivující všechny CSS animace
- **Perzistence** — nastavení se ukládá do `localStorage` a přetrvává mezi sezeními

---

### 💾 Export a import herního uložení
- **Export save** — celý stav hry se serializuje do Base64 řetězce a zkopíruje do schránky
- **Import save** — hráč může vložit save kód a obnovit stav hry (i na jiném zařízení)
- **Validace** — chybějící pole se při importu nahradí výchozími hodnotami, chybný kód zobrazí chybovou hlášku

---

### 🔄 Prestiž
- **Reset s bonusem** — hráč může resetovat hru (peníze, upgrady, captcha count) výměnou za permanentní násobič příjmu
- **Narůstající požadavek** — výchozí práh $10 000 lifetime earnings, každá další prestiž vyžaduje 3× více
- **Násobič příjmu** — každá prestiž přidá +25 % k celkovému příjmu (Prestiž 1 = ×1,25; Prestiž 2 = ×1,50 atd.)
- **Zachování achievementů** — achievementy se přes prestiž nepřenulují
- **Prestiž badge** — po první prestiži se v herní obrazovce zobrazí odznak s počtem prestižích a aktuálním násobičem

---

### 🏆 Achievementy

| Kategorie | Achievement | Podmínka |
|-----------|-------------|----------|
| Clicking | Newbie Clicker | 100 captch |
| Clicking | Experienced Clicker | 1 000 captch |
| Clicking | Click Master | 10 000 captch |
| Clicking | Click God | 100 000 captch |
| Special | Golden Touch | 1 zlatá captcha |
| Special | Golden Hunter | 10 zlatých captch |
| Special | Midas | 100 zlatých captch |
| Shop | First Upgrade | první nákup |
| Shop | Big Spender | $1 000 utraceno |
| Shop | Tech Enthusiast | odemčení Script |
| Shop | Full House | 5 slotů |
| Money | Pocket Change | $100 earned |
| Money | Richie Rich | $10 000 earned |
| Money | Millionaire | $1 000 000 earned |
| Prestige | Rebirth | 1. prestiž |
| Prestige | Triple Threat | 3 prestiže |
| Prestige | Eternal Grinder | 10 prestižích |
| Secret | Hacker? | skrytá podmínka |
| Secret | Patient | skrytá podmínka |

**Toast notifikace** — při odemčení se zobrazí zlatý banner dole uprostřed, zmizí po 4 s nebo kliknutím. Více achievementů se zobrazuje postupně ve frontě. Zamčené achievementy jsou v panelu skryté za 🔒 a textem „???".

---

### ⭐ Zlatá captcha
- Každých 15–45 sekund se jeden slot náhodně změní na zlatou captchu
- Zlatá captcha má zlatý rámeček, zlaté pozadí a pulzující záři
- Vyřešení dá **10× více peněz** než normální captcha
- Zobrazí odznak „✨ GOLDEN" v pravém horním rohu
- Po 8 sekundách bez vyřešení zmizí

---

### 🖼️ Image captcha popup
- Náhodný fullscreen popup každých **90–180 sekund** (pouze pokud má hráč alespoň $10)
- Věrná replika Google reCAPTCHA v2 image designu — modrý header, 3×3 mřížka, refresh/audio/info tlačítka, VERIFY button
- **Dvě kategorie** — střídá se mezi crosswalks a traffic lights
- **9 vlastních lokálních fotografií** rozdělených do kategorií; mřížka se při každém zobrazení zamíchá
- Špatná odpověď = zatřesení + „Please try again" + reset mřížky
- Úspěšné vyřešení udělí **+10 % aktuálních peněz** a přehraje `correct.mp3`