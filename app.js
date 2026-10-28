const ukedager = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
let aktivtSteg = 0;

// ==========================================
// 1. STEG-NAVIGASJON & STARTLOGIKK
// ==========================================

// Global variabel for å holde styr på om avtalen er lagret/skrevet ut på steg 4
let isSteg4Completed = false;

// Hjelpefunksjon for å sjekke om steg 1, 2 og 3 er komplett utfylt
function erGrunnlagsdataFullstendig() {
    const skole = document.getElementById('skoleNavn')?.value.trim();
    const ansatt = document.getElementById('ansattNavn')?.value.trim();
    const arslonnRaw = document.getElementById('arslonn')?.value.trim();
    const arslonn = parseFloat(arslonnRaw?.replace(/\s/g, '')) || 0;
    const steg1OK = !!(skole && ansatt && arslonn > 0);

    const startTid = document.getElementById('startTid')?.value;
    const sluttTid = document.getElementById('sluttTid')?.value;
    const steg2og3OK = !!(startTid && sluttTid);

    return steg1OK && steg2og3OK;
}

// Sjekker om kriteriene for et gitt steg er 100% oppfylt
function sjekkStegFullfoert(stegNummer) {
    const skole = document.getElementById('skoleNavn')?.value.trim();
    const ansatt = document.getElementById('ansattNavn')?.value.trim();
    const arslonnRaw = document.getElementById('arslonn')?.value.trim();
    const arslonn = parseFloat(arslonnRaw?.replace(/\s/g, '')) || 0;
    const steg1OK = !!(skole && ansatt && arslonn > 0);

    const startTid = document.getElementById('startTid')?.value;
    const sluttTid = document.getElementById('sluttTid')?.value;
    const steg2og3OK = !!(startTid && sluttTid);

    switch (stegNummer) {
        case 1:
            return steg1OK;

        case 2:
        case 3:
            return steg2og3OK;

        case 4:
            // Steg 4 er KUN fullført (grønn) dersom grunnlaget er OK OG det er lagret/skrevet ut
            return erGrunnlagsdataFullstendig() && isSteg4Completed;

        default:
            return false;
    }
}


// Oppdaterer farge på indikator-ringene (Grønn vs Oransje)
function oppdaterStegIndikatorer(aktuellSteg) {
    const stepItems = document.querySelectorAll('.step-item');
    
    stepItems.forEach((item, index) => {
        // Start-knappen (index 0)
        if (index === 0) {
            item.classList.remove('active', 'completed', 'warning');
            if (aktuellSteg === 0) {
                item.classList.add('active');
            } else {
                item.classList.add('completed');
            }
            return;
        }

        const stegNr = index; // 1, 2, 3 eller 4
        const erFullfoert = sjekkStegFullfoert(stegNr);

        // Nullstill alle status- og aktiv-klasser
        item.classList.remove('active', 'completed', 'warning');

        if (stegNr === aktuellSteg) {
            // NÅVÆRENDE STEG: Vis blå farge (active)
            item.classList.add('active');
            
            // Hvis det nåværende steget allerede er fullstendig utfylt, kan det også få grønn farge
            if (erFullfoert) {
                item.classList.add('completed');
            }
        } else if (stegNr < aktuellSteg) {
            // PASSERTE STEG: Vis grønn hvis alt er fylt ut, eller oransje hvis du har hoppet over felter
            if (erFullfoert) {
                item.classList.add('completed'); // Grønn
            } else {
                item.classList.add('warning');   // Oransje
            }
        }
        // FREMTIDIGE STEG (stegNr > aktuellSteg): Beholder nøytral/grå farge uten klasser!
    });
}

function gaaTilSteg(stegNummer) {
    if (stegNummer < 0 || stegNummer > 4) return;
    aktivtSteg = stegNummer;

    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stegNummer}`)?.classList.add('active');

    document.querySelectorAll('.step-item').forEach((item, index) => {
        if (index <= stegNummer) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    oppdaterStegIndikatorer(stegNummer);

    const header = document.querySelector('header.no-print');
    if (header) {
        if (stegNummer === 0) {
            header.classList.remove('hide-subtitle-laptop');
        } else {
            header.classList.add('hide-subtitle-laptop');
        }
    }

    if (stegNummer === 0) {
        oppdaterStartsideKnapper();
    } else if (stegNummer === 3 || stegNummer === 4) {
        beregnAlt();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nesteSteg() { gaaTilSteg(aktivtSteg + 1); }
function forrigeSteg() { gaaTilSteg(aktivtSteg - 1); }

// Nullstiller godkjenningen på steg 4 dersom brukeren endrer/fyller ut verdier i ettertid
function nullstillSteg4Fullfoering() {
    if (isSteg4Completed) {
        isSteg4Completed = false;
        oppdaterStegIndikatorer(aktivtSteg);
    }
}

// Lytter på utskrift – krever at grunnlaget var i orden
window.addEventListener('afterprint', () => {
    isSteg4Completed = erGrunnlagsdataFullstendig();
    oppdaterStegIndikatorer(aktivtSteg);
});

// Funksjon for lagring – krever at grunnlaget var i orden
function markerSteg4SomLagret() {
    isSteg4Completed = erGrunnlagsdataFullstendig();
    oppdaterStegIndikatorer(aktivtSteg);
}

function erSkjemaUtfylt() {
    const ansatt = document.getElementById('ansattNavn')?.value.trim();
    const arslonn = document.getElementById('arslonn')?.value.trim();
    const start = document.getElementById('startTid')?.value;
    const slutt = document.getElementById('sluttTid')?.value;
    
    let harLagretUtkast = false;
    try {
        const utkastStr = localStorage.getItem('leirskole_siste_utkast');
        if (utkastStr) {
            const u = JSON.parse(utkastStr);
            if (u.ansattNavn?.trim() || u.arslonn?.trim() || u.startTid || u.sluttTid) {
                harLagretUtkast = true;
            }
        }
    } catch(e) {}

    return !!(ansatt || arslonn || start || slutt || harLagretUtkast);
}

function oppdaterStartsideKnapper() {
    const btnFortsett = document.getElementById('btnFortsett');
    if (!btnFortsett) return;

    if (erSkjemaUtfylt()) {
        btnFortsett.style.display = 'inline-block';
    } else {
        btnFortsett.style.display = 'none';
    }
}

function fortsettPaaGjeldende() {
    gaaTilSteg(1);
}

function startNyAvtale() {
    if (erSkjemaUtfylt()) {
        const bekreft = confirm("Det finnes allerede data i skjemaet. Ønsker du å tømme skjemaet og starte på en ny avtale?\n\n(Trykk 'Avbryt' hvis du vil beholde det du har skrevet).");
        if (!bekreft) return;
    }
    
    // 1. Nullstill status for Steg 4
    isSteg4Completed = false;
    
    // 2. Tøm alle innfylte feltverdier i skjemaet
    if (document.getElementById('skoleNavn')) document.getElementById('skoleNavn').value = '';
    if (document.getElementById('ansattNavn')) document.getElementById('ansattNavn').value = '';
    if (document.getElementById('arslonn')) document.getElementById('arslonn').value = '';
    if (document.getElementById('startTid')) document.getElementById('startTid').value = '';
    if (document.getElementById('sluttTid')) document.getElementById('sluttTid').value = '';
    if (document.getElementById('faktiskTid')) document.getElementById('faktiskTid').value = '0';
    if (document.getElementById('stillingsprosent')) document.getElementById('stillingsprosent').value = '100';
    if (document.getElementById('turType')) document.getElementById('turType').value = 'eks3';
    
    // 3. Tøm timeplan-tabellen
    const tbody = document.getElementById('dagerTbody');
    if (tbody) tbody.innerHTML = '';

    // 4. Slett lagret utkast fra minnet
    localStorage.removeItem('leirskole_siste_utkast');
    
    // 5. Oppdater felter og rekalkuler
    if (typeof toggleTurTypeFields === 'function') toggleTurTypeFields();
    beregnAlt();

    // 6. Naviger direkte til Steg 1
    gaaTilSteg(1);
}

// ==========================================
// 2. LAGRING OG ARKIVERING (LOCALSTORAGE)
// ==========================================
let aksjonEtterLagring = null;

function hentAlleLagredeAvtaler() {
    try {
        return JSON.parse(localStorage.getItem('leirskole_arkiv')) || [];
    } catch (e) {
        return [];
    }
}

function lagreAktivTilStorage() {
    const data = hentSkjemaData();
    localStorage.setItem('leirskole_siste_utkast', JSON.stringify(data));
}

function hentSkjemaData() {
    const dagsTider = [];
    document.querySelectorAll('#dagerTbody tr').forEach(rad => {
        const dato = rad.querySelector('.dag-start')?.getAttribute('data-dato');
        const start = rad.querySelector('.dag-start')?.value || '';
        const slutt = rad.querySelector('.dag-slutt')?.value || '';
        if (dato) dagsTider.push({ dato, start, slutt });
    });

    return {
        id: Date.now(),
        datoOpprettet: new Date().toLocaleDateString('no-NO'),
        skoleNavn: document.getElementById('skoleNavn')?.value || '',
        ansattNavn: document.getElementById('ansattNavn')?.value || '',
        stillingsprosent: document.getElementById('stillingsprosent')?.value || '100',
        arslonn: document.getElementById('arslonn')?.value || '',
        turType: document.getElementById('turType')?.value || 'eks3',
        oppgjorsModell: document.querySelector('input[name="oppgjorsModell"]:checked')?.value || 'alt1',
        startTid: document.getElementById('startTid')?.value || '',
        sluttTid: document.getElementById('sluttTid')?.value || '',
        faktiskTid: document.getElementById('faktiskTid')?.value || '0',
        dagsTider: dagsTider
    };
}

function apneLagreModal(ettersagringAksjon = null) {
    aksjonEtterLagring = ettersagringAksjon;
    const ansatt = document.getElementById('ansattNavn').value.trim() || 'Uten navn';
    const navneInput = document.getElementById('lagreAvtaleNavnInput');
    if (navneInput) navneInput.value = `Avtale - ${ansatt}`;

    oppdaterEksisterendeAvtalerListe();
    document.getElementById('modalLagre')?.classList.add('active');
}

function lukkLagreModal() {
    document.getElementById('modalLagre')?.classList.remove('active');
    aksjonEtterLagring = null;
}

function oppdaterEksisterendeAvtalerListe() {
    const container = document.getElementById('eksisterendeAvtalerListe');
    if (!container) return;
    const arkiv = hentAlleLagredeAvtaler();

    if (arkiv.length === 0) {
        container.innerHTML = `<p style="font-size:12px; color:var(--text-muted); margin:5px 0;">Ingen tidligere avtaler lagret.</p>`;
        return;
    }

    let html = `<p style="font-size:12px; font-weight:600; color:var(--primary); margin:8px 0 4px 0;">Klikk på en eksisterende avtale for å skrive over:</p><div style="max-height:120px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; padding:4px;">`;
    arkiv.forEach(item => {
        const tittel = item.arkivNavn || `Avtale - ${item.ansattNavn || 'Uten navn'}`;
        html += `
            <div onclick="velgNavnForOverskriving('${tittel.replace(/'/g, "\\'")}')" style="padding:6px 8px; font-size:12.5px; cursor:pointer; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                <span>📄 <strong>${tittel}</strong> (${item.ansattNavn || '-'})</span>
                <small style="color:var(--text-muted);">${item.datoOpprettet || ''}</small>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function velgNavnForOverskriving(tittel) {
    const navneInput = document.getElementById('lagreAvtaleNavnInput');
    if (navneInput) navneInput.value = tittel;
}

function bekreftLagringIArkiv() {
    const navneInput = document.getElementById('lagreAvtaleNavnInput');
    const avtaleNavn = navneInput?.value.trim();
    
    if (!avtaleNavn) {
        alert("Vennligst oppgi et navn på avtalen.");
        return;
    }

    let arkiv = hentAlleLagredeAvtaler();
    const data = hentSkjemaData();
    data.arkivNavn = avtaleNavn;

    const eksisterendeIndex = arkiv.findIndex(item => item.arkivNavn === avtaleNavn);

    if (eksisterendeIndex !== -1) {
        const overskriv = confirm(`Det finnes allerede en lagret avtale med navnet "${avtaleNavn}". Vil du skrive over denne?`);
        if (!overskriv) return;
        arkiv[eksisterendeIndex] = data;
    } else {
        arkiv.push(data);
    }

    localStorage.setItem('leirskole_arkiv', JSON.stringify(arkiv));
    
    // Marker Steg 4 som fullført KUN dersom grunnlagsdataene er OK
    markerSteg4SomLagret();

    lukkLagreModal();

    if (aksjonEtterLagring === 'ny') {
        if (document.getElementById('ansattNavn')) document.getElementById('ansattNavn').value = '';
        if (document.getElementById('arslonn')) document.getElementById('arslonn').value = '';
        if (document.getElementById('startTid')) document.getElementById('startTid').value = '';
        if (document.getElementById('sluttTid')) document.getElementById('sluttTid').value = '';
        if (document.getElementById('faktiskTid')) document.getElementById('faktiskTid').value = '0';
        if (document.getElementById('stillingsprosent')) document.getElementById('stillingsprosent').value = '100';
        if (document.getElementById('turType')) document.getElementById('turType').value = 'eks3';
        
        const tbody = document.getElementById('dagerTbody');
        if (tbody) tbody.innerHTML = '';

        localStorage.removeItem('leirskole_siste_utkast');

        isSteg4Completed = false;
        besokteSteg.clear();
        besokteSteg.add(0);

        toggleTurTypeFields();
        beregnAlt();

        alert(`Avtalen "${avtaleNavn}" ble lagret! Skjemaet er nå tømt.`);
        gaaTilSteg(0);
    } else {
        alert(`Avtalen "${avtaleNavn}" ble lagret i arkivet!`);
    }
}

function lagreAvtaleIArkiv() {
    apneLagreModal(null);
}

function lagreOgStartNy() {
    apneLagreModal('ny');
}

function lastInnAvtaleFraData(data) {
    if (!data) return;
    if (data.skoleNavn) document.getElementById('skoleNavn').value = data.skoleNavn;
    if (data.ansattNavn) document.getElementById('ansattNavn').value = data.ansattNavn;
    if (data.stillingsprosent) document.getElementById('stillingsprosent').value = data.stillingsprosent;
    if (data.arslonn) document.getElementById('arslonn').value = data.arslonn;
    if (data.turType) document.getElementById('turType').value = data.turType;
    if (data.startTid) document.getElementById('startTid').value = data.startTid;
    if (data.sluttTid) document.getElementById('sluttTid').value = data.sluttTid;
    if (data.faktiskTid) document.getElementById('faktiskTid').value = data.faktiskTid;
    
    if (data.oppgjorsModell) {
        const radio = document.querySelector(`input[name="oppgjorsModell"][value="${data.oppgjorsModell}"]`);
        if (radio) radio.checked = true;
    }

    toggleTurTypeFields();
    genererDagerTabell();

    if (data.dagsTider && Array.isArray(data.dagsTider)) {
        data.dagsTider.forEach(item => {
            const startInput = document.querySelector(`.dag-start[data-dato="${item.dato}"]`);
            const sluttInput = document.querySelector(`.dag-slutt[data-dato="${item.dato}"]`);
            if (startInput) startInput.value = item.start;
            if (sluttInput) sluttInput.value = item.slutt;
        });
    }

    // Markerer Steg 4 som fullført dersom en komplett arkivert avtale lastes inn
    if (data.arkivNavn) {
        isSteg4Completed = erGrunnlagsdataFullstendig();
    }

    beregnAlt();
}

function lastInnSisteUtkast() {
    const minne = localStorage.getItem('leirskole_siste_utkast');
    if (minne) {
        try {
            lastInnAvtaleFraData(JSON.parse(minne));
        } catch(e) { console.error(e); }
    }
}

// Kobler til hendelseslyttere for automatisk nullstilling av steg 4 dersom skjemaendringer skjer
document.addEventListener('DOMContentLoaded', () => {
    const felter = ['skoleNavn', 'ansattNavn', 'arslonn', 'startTid', 'sluttTid', 'faktiskTid'];
    felter.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', nullstillSteg4Fullfoering);
            el.addEventListener('change', nullstillSteg4Fullfoering);
        }
    });
});

// ==========================================
// 3. ARKIV MODAL LOGIKK
// ==========================================
function apneArkivModal() {
    oppdaterArkivTabell();
    document.getElementById('modalArkiv')?.classList.add('active');
}

function lukkArkivModal() {
    document.getElementById('modalArkiv')?.classList.remove('active');
}

function oppdaterArkivTabell() {
    const tbody = document.getElementById('arkivTbody');
    if (!tbody) return;
    const arkiv = hentAlleLagredeAvtaler();

    tbody.innerHTML = "";
    if (arkiv.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">Ingen lagrede avtaler funnet.</td></tr>`;
        return;
    }

    arkiv.forEach((item, index) => {
        const rad = document.createElement('tr');
        rad.innerHTML = `
            <td><strong>${item.arkivNavn || 'Uten navn'}</strong></td>
            <td>${item.ansattNavn || '-'}</td>
            <td><small>${item.datoOpprettet || '-'}</small></td>
            <td class="archive-actions">
                <button class="btn-sm" onclick="velgAvtaleFraArkiv(${index})">📂 Åpne</button>
                <button class="btn-sm btn-danger" onclick="slettAvtaleFraArkiv(${index})">🗑️ Slett</button>
            </td>
        `;
        tbody.appendChild(rad);
    });
}

function velgAvtaleFraArkiv(index) {
    const arkiv = hentAlleLagredeAvtaler();
    if (arkiv[index]) {
        lastInnAvtaleFraData(arkiv[index]);
        lukkArkivModal();
        gaaTilSteg(1);
    }
}

function slettAvtaleFraArkiv(index) {
    if (!confirm("Er du sikker på at du vil slette denne avtalen?")) return;
    const arkiv = hentAlleLagredeAvtaler();
    arkiv.splice(index, 1);
    localStorage.setItem('leirskole_arkiv', JSON.stringify(arkiv));
    oppdaterArkivTabell();
}

function eksporterArkivJSON() {
    const arkiv = hentAlleLagredeAvtaler();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arkiv, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Leirskoleavtaler_Sikkerhetskopi_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importerArkivJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importert = JSON.parse(e.target.result);
            if (Array.isArray(importert)) {
                localStorage.setItem('leirskole_arkiv', JSON.stringify(importert));
                oppdaterArkivTabell();
                alert("Arkivet ble importert!");
            } else {
                alert("Ugyldig filformat.");
            }
        } catch(err) {
            alert("Kunne ikke lese JSON-filen.");
        }
    };
    reader.readAsText(file);
}

// ==========================================
// 4. PREVIEW OG BEREGNING LOGIKK
// ==========================================
function apneModal() {
    beregnAlt();
    document.getElementById('modalPreview')?.classList.add('active');
}

function lukkModal() {
    document.getElementById('modalPreview')?.classList.remove('active');
}

function toggleTurTypeFields() {
    const type = document.getElementById('turType').value;
    document.getElementById('del1Felter').style.display = (type === 'eks1' || type === 'eks2') ? 'block' : 'none';
}

function formatertArslonnInput() {
    const input = document.getElementById('arslonn');
    let rentNummer = input.value.replace(/\D/g, '');
    if (rentNummer) {
        input.value = Number(rentNummer).toLocaleString('no-NO').replace(/,/g, ' ');
    } else {
        input.value = '';
    }
    beregnAlt();
}

function oppdaterValgtModellVisning(valgtModell) {
    document.querySelectorAll('.model-option').forEach(el => el.classList.remove('selected'));
    const valgtRadio = document.querySelector(`input[name="oppgjorsModell"][value="${valgtModell}"]`);
    if (valgtRadio) {
        valgtRadio.closest('.model-option').classList.add('selected');
    }

    const chk1 = document.getElementById('chkAlt1');
    const chk2 = document.getElementById('chkAlt2');
    const chk3 = document.getElementById('chkAlt3');

    if (chk1) chk1.innerText = (valgtModell === 'alt1') ? '[ X ]' : '[   ]';
    if (chk2) chk2.innerText = (valgtModell === 'alt2') ? '[ X ]' : '[   ]';
    if (chk3) chk3.innerText = (valgtModell === 'alt3') ? '[ X ]' : '[   ]';

    document.getElementById('rowAlt1')?.classList.toggle('selected-row', valgtModell === 'alt1');
    document.getElementById('rowAlt2')?.classList.toggle('selected-row', valgtModell === 'alt2');
    document.getElementById('rowAlt3')?.classList.toggle('selected-row', valgtModell === 'alt3');
}

function genererDagerTabell() {
    const startInput = document.getElementById('startTid').value;
    const sluttInput = document.getElementById('sluttTid').value;
    const tbody = document.getElementById('dagerTbody');
    if (!tbody || !startInput || !sluttInput) return;

    const startDato = new Date(startInput.split('T')[0] + "T00:00:00");
    const sluttDato = new Date(sluttInput.split('T')[0] + "T00:00:00");
    
    if (isNaN(startDato.getTime()) || isNaN(sluttDato.getTime())) return;

    tbody.innerHTML = ""; 
    let gjeldendeDato = new Date(startDato);
    
    while (gjeldendeDato <= sluttDato) {
        const datoStreng = gjeldendeDato.toISOString().split('T')[0];
        const dagIndex = gjeldendeDato.getDay(); 
        let sStart = "", sSlutt = "";
        
        if (dagIndex >= 1 && dagIndex <= 5 && GRUNNSATSER.standardRammetid && GRUNNSATSER.standardRammetid[dagIndex]) {
            sStart = GRUNNSATSER.standardRammetid[dagIndex].start || "";
            sSlutt = GRUNNSATSER.standardRammetid[dagIndex].slutt || "";
        }

        const rad = document.createElement('tr');
        rad.setAttribute('data-dagindex', dagIndex);
        rad.innerHTML = `
            <td><strong>${ukedager[dagIndex]}</strong> <small style="color:#64748b;">${gjeldendeDato.toLocaleDateString('no-NO')}</small></td>
            <td><input type="time" class="dag-start" value="${sStart}" data-dato="${datoStreng}" onchange="beregnAlt()"></td>
            <td><input type="time" class="dag-slutt" value="${sSlutt}" data-dato="${datoStreng}" onchange="beregnAlt()"></td>
            <td><span class="dag-timer" id="timer-${datoStreng}">0</span> t</td>
        `;
        tbody.appendChild(rad);
        gjeldendeDato.setDate(gjeldendeDato.getDate() + 1);
    }
    beregnAlt();
}

function fyllStandardTider() {
    document.querySelectorAll('#dagerTbody tr').forEach(rad => {
        const dagIndex = parseInt(rad.getAttribute('data-dagindex'), 10);
        const inputs = rad.querySelectorAll('input[type="time"]');
        if (inputs.length === 2 && dagIndex >= 1 && dagIndex <= 5 && GRUNNSATSER.standardRammetid[dagIndex]) {
            inputs[0].value = GRUNNSATSER.standardRammetid[dagIndex].start;
            inputs[1].value = GRUNNSATSER.standardRammetid[dagIndex].slutt;
        }
    });
    beregnAlt();
}

function nullstillTider() {
    document.querySelectorAll('#dagerTbody tr input[type="time"]').forEach(i => i.value = "");
    beregnAlt();
}

function beregnOrdinatTidFraTabell() {
    const startFelter = document.querySelectorAll('.dag-start');
    const sluttFelter = document.querySelectorAll('.dag-slutt');
    let totalOrdinatTid = 0;
    
    for (let i = 0; i < startFelter.length; i++) {
        const startVal = startFelter[i].value;
        const sluttVal = sluttFelter[i] ? sluttFelter[i].value : "";
        const datoStreng = startFelter[i].getAttribute('data-dato');
        const visning = document.getElementById(`timer-${datoStreng}`);

        if (startVal && sluttVal) {
            const [sH, sM] = startVal.split(':').map(Number);
            const [lH, lM] = sluttVal.split(':').map(Number);
            
            let diff = (lH + lM/60) - (sH + sM/60);
            if (diff > 0) {
                if (visning) visning.innerText = diff.toFixed(1);
                totalOrdinatTid += diff; 
            } else {
                if (visning) visning.innerText = "0";
            }
        } else {
            if (visning) visning.innerText = "0";
        }
    }
    const totVisning = document.getElementById('ordinarTotalVisning');
    if (totVisning) totVisning.innerText = totalOrdinatTid.toFixed(1);
    return totalOrdinatTid;
}



// ==========================================
// SKOLEPROFIL OG LOGO LOGIKK (DYNAMISK HÅNES-DEFAULT OG ARKIV PER SKOLE)
// ==========================================

// Standard profil for Hånes skoleenhet
const standardHanesProfil = {
    gate: 'Øvre Brattbakken 1',
    post: '4635 Kristiansand',
    org: '974 598 825',
    tlf: '41535959',
    epost: 'Post.Hanes.Skole@kristiansand.kommune.no',
    web: 'www.minskole.no/haanes',
    logo: 'logo_haanes.png'
};

function apneSkoleModal() {
    lastInnSkoleProfil();
    const modal = document.getElementById('modalSkole');
    if (modal) {
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.zIndex = '2000';
    }
}

function lukkSkoleModal() {
    const modal = document.getElementById('modalSkole');
    if (modal) {
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
    }
}

function handterLogoOpplasting(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        lagreSkoleProfil(base64Image);
    };
    reader.readAsDataURL(file);
}

function fjernLogo() {
    const input = document.getElementById('skoleLogoInput');
    if (input) input.value = '';
    lagreSkoleProfil(''); // Fjerner logo for aktiv profil
}

// Lagrer profil og logo knyttet til det valgte skolenavnet
function lagreSkoleProfil(nyLogoBase64) {
    const skoleNavn = document.getElementById('skoleNavn')?.value.trim() || 'Skole/Virksomhet';
    
    // Hent alle lagrede skoleprofiler fra localStorage
    let arkiv = {};
    try {
        arkiv = JSON.parse(localStorage.getItem('leirskole_skoleprofiler_arkiv')) || {};
    } catch(e) { arkiv = {}; }

    // Hent eksisterende logo dersom det ikke er medsendt en ny logo eller fjerning
    const eksisterendeProfil = arkiv[skoleNavn] || {};
    let gjeldedeLogo = (nyLogoBase64 !== undefined) ? nyLogoBase64 : (eksisterendeProfil.logo || '');

    const profil = {
        gate: document.getElementById('skoleGateInput')?.value || '',
        post: document.getElementById('skolePostInput')?.value || '',
        org: document.getElementById('skoleOrgInput')?.value || '',
        tlf: document.getElementById('skoleTlfInput')?.value || '',
        epost: document.getElementById('skoleEpostInput')?.value || '',
        web: document.getElementById('skoleWebInput')?.value || '',
        logo: gjeldedeLogo
    };

    arkiv[skoleNavn] = profil;
    localStorage.setItem('leirskole_skoleprofiler_arkiv', JSON.stringify(arkiv));
    oppdaterSkoleVisning();
}

// Laster inn riktig profil basert på skolenavnet i feltet
function lastInnSkoleProfil() {
    const skoleNavn = document.getElementById('skoleNavn')?.value.trim() || 'Hånes skoleenhet';
    
    let arkiv = {};
    try {
        arkiv = JSON.parse(localStorage.getItem('leirskole_skoleprofiler_arkiv')) || {};
    } catch(e) { arkiv = {}; }

    let profil = arkiv[skoleNavn];

    // Sjekk om skolenavnet matcher "Hånes skoleenhet" ELLER "Hånes skole"
    const navnsjekk = skoleNavn.toLowerCase();
    const erHanes = navnsjekk === 'hånes skoleenhet' || navnsjekk === 'hånes skole';

    if (!profil && erHanes) {
        profil = standardHanesProfil;
    }

    // Fyll inn i skjemaet hvis feltene finnes
    if (document.getElementById('skoleGateInput')) document.getElementById('skoleGateInput').value = profil?.gate || '';
    if (document.getElementById('skolePostInput')) document.getElementById('skolePostInput').value = profil?.post || '';
    if (document.getElementById('skoleOrgInput')) document.getElementById('skoleOrgInput').value = profil?.org || '';
    if (document.getElementById('skoleTlfInput')) document.getElementById('skoleTlfInput').value = profil?.tlf || '';
    if (document.getElementById('skoleEpostInput')) document.getElementById('skoleEpostInput').value = profil?.epost || '';
    if (document.getElementById('skoleWebInput')) document.getElementById('skoleWebInput').value = profil?.web || '';

    oppdaterSkoleVisning();
}

function oppdaterSkoleVisning() {
    const skoleNavn = document.getElementById('skoleNavn')?.value.trim() || 'Skole/Virksomhet';
    
    let arkiv = {};
    try {
        arkiv = JSON.parse(localStorage.getItem('leirskole_skoleprofiler_arkiv')) || {};
    } catch(e) { arkiv = {}; }

    let profil = arkiv[skoleNavn];

    const navnsjekk = skoleNavn.toLowerCase();
    const erHanes = navnsjekk === 'hånes skoleenhet' || navnsjekk === 'hånes skole';

    if (!profil && erHanes) {
        profil = standardHanesProfil;
    }

    // Oppdater venstre side i bunnteksten
    const conFooterSkole = document.getElementById('conFooterSkole');
    if (conFooterSkole) conFooterSkole.innerText = skoleNavn;
    
    const conFooterOrg = document.getElementById('conFooterOrg');
    if (conFooterOrg) conFooterOrg.innerText = profil?.org ? `(${profil.org})` : '';

    const conFooterAdresse = document.getElementById('conFooterAdresse');
    if (conFooterAdresse) {
        const adrKomplett = [profil?.gate, profil?.post].filter(Boolean).join(' / ');
        conFooterAdresse.innerText = adrKomplett;
    }

    const conFooterTlf = document.getElementById('conFooterTlf');
    if (conFooterTlf) conFooterTlf.innerText = profil?.tlf ? `Tlf: ${profil.tlf}` : '';

    // Oppdater høyre side i bunnteksten
    const conFooterEpost = document.getElementById('conFooterEpost');
    if (conFooterEpost) conFooterEpost.innerText = profil?.epost || '';

    const conFooterWeb = document.getElementById('conFooterWeb');
    if (conFooterWeb) conFooterWeb.innerText = profil?.web || '';

    // Oppdater logo-visning i kontrakt og forhåndsvisning
    const conLogoVisning = document.getElementById('conLogoVisning');
    const conLogoImg = document.getElementById('conLogoImg');
    const logoPreviewContainer = document.getElementById('logoPreviewContainer');
    const logoPreviewImg = document.getElementById('logoPreviewImg');

    const logoSrc = profil?.logo || '';

    if (logoSrc) {
        if (conLogoImg) conLogoImg.src = logoSrc;
        if (conLogoVisning) conLogoVisning.style.display = 'block';
        if (logoPreviewImg) logoPreviewImg.src = logoSrc;
        if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
    } else {
        if (conLogoVisning) conLogoVisning.style.display = 'none';
        if (logoPreviewContainer) logoPreviewContainer.style.display = 'none';
    }
}


// ==========================================
// SKOLEPROFIL SLUTT
// ==========================================
function beregnAlt() {
    lagreAktivTilStorage();
    
    const startInputStr = document.getElementById('startTid')?.value || "";
    const sluttInputStr = document.getElementById('sluttTid')?.value || "";
    const valgtModell = document.querySelector('input[name="oppgjorsModell"]:checked')?.value || 'alt1';
    
    oppdaterValgtModellVisning(valgtModell);

    const conNavn = document.getElementById('conNavn');
    if (conNavn) conNavn.innerText = document.getElementById('ansattNavn')?.value || "-";

    const conSkole = document.getElementById('conSkole');
    if (conSkole) conSkole.innerText = document.getElementById('skoleNavn')?.value || "-";

    const conGjelderAar = document.getElementById('conGjelderAar');
    if (conGjelderAar && typeof GRUNNSATSER !== 'undefined') conGjelderAar.innerText = GRUNNSATSER.gjelderAar;
    
    const ordinarTid = typeof beregnOrdinatTidFraTabell === 'function' ? beregnOrdinatTidFraTabell() : 0;
    const turType = document.getElementById('turType')?.value || 'eks3';
    const stillingsType = document.getElementById('stillingsprosent')?.value || '100';
    const faktiskTid = parseFloat(document.getElementById('faktiskTid')?.value) || 0;
    
    const arslonnRaw = (document.getElementById('arslonn')?.value || "").replace(/\s/g, '');
    const arslonn = parseFloat(arslonnRaw) || 0;

    const conArslonn = document.getElementById('conArslonn');
    if (conArslonn) {
        if (arslonn > 0) {
            conArslonn.innerText = `kr ${arslonn.toLocaleString('no-NO')},-`;
        } else {
            conArslonn.innerText = "-";
        }
    }

    const conOrdinar = document.getElementById('conOrdinar');
    if (conOrdinar) conOrdinar.innerText = ordinarTid.toFixed(1);
    
    // HVIS TIDSROM MANGLER: FULLSTENDIG NULLSTILLING AV ALLE BEREGNEDE VISNINGSFELTER
    if (!startInputStr || !sluttInputStr) {
        // Hovedoppsummering i skjema
        if (document.getElementById('resVarighet')) document.getElementById('resVarighet').innerText = "-";
        if (document.getElementById('resDognSum')) document.getElementById('resDognSum').innerText = "0,-";
        if (document.getElementById('resNettoTimerVisning')) document.getElementById('resNettoTimerVisning').innerText = "0 timer";

        // Kontrakt / Forhåndsvisningsfelter
        if (document.getElementById('conVarighet')) document.getElementById('conVarighet').innerText = "-";
        if (document.getElementById('conStart')) document.getElementById('conStart').innerText = "-";
        if (document.getElementById('conSlutt')) document.getElementById('conSlutt').innerText = "-";
        if (document.getElementById('conDognBeregning')) document.getElementById('conDognBeregning').innerText = "-";
        if (document.getElementById('conDognTotal')) document.getElementById('conDognTotal').innerText = "0";
        if (document.getElementById('conGodskrevet')) document.getElementById('conGodskrevet').innerText = "0.0";
        if (document.getElementById('conNetto')) document.getElementById('conNetto').innerText = "0.0";

        // STEG 4: ALT. 1 (KORT OG TABELL)
        if (document.getElementById('mAlt1Lonn')) document.getElementById('mAlt1Lonn').innerText = "0";
        if (document.getElementById('mAlt1Timer')) document.getElementById('mAlt1Timer').innerText = "0";
        if (document.getElementById('tAlt1Lonn')) document.getElementById('tAlt1Lonn').innerText = "0";
        if (document.getElementById('tAlt1Timer')) document.getElementById('tAlt1Timer').innerText = "0";

        // STEG 4: ALT. 2 (KORT OG TABELL)
        if (document.getElementById('mAlt2Total')) document.getElementById('mAlt2Total').innerText = "0";
        if (document.getElementById('mAlt2Sats')) document.getElementById('mAlt2Sats').innerText = "0";
        if (document.getElementById('mAlt2Overtid')) document.getElementById('mAlt2Overtid').innerText = "0";
        if (document.getElementById('tAlt2Total')) document.getElementById('tAlt2Total').innerText = "0";
        if (document.getElementById('tAlt2Sats')) document.getElementById('tAlt2Sats').innerText = "0";
        if (document.getElementById('tAlt2Overtid')) document.getElementById('tAlt2Overtid').innerText = "0";

        // STEG 4: ALT. 3 (KORT OG TABELL)
        if (document.getElementById('mAlt3SamletDager')) document.getElementById('mAlt3SamletDager').innerText = "0";
        if (document.getElementById('mAlt3DagerVis')) document.getElementById('mAlt3DagerVis').innerText = "0";
        if (document.getElementById('mAlt3TimerOmregnetVis')) document.getElementById('mAlt3TimerOmregnetVis').innerText = "0";
        if (document.getElementById('mAlt3TilleggKroner')) document.getElementById('mAlt3TilleggKroner').innerText = "0";
        if (document.getElementById('tAlt3SamletSamling')) document.getElementById('tAlt3SamletSamling').innerText = "0";
        if (document.getElementById('tAlt3DagerVis')) document.getElementById('tAlt3DagerVis').innerText = "0";
        if (document.getElementById('tAlt3TimerOmregnetVis')) document.getElementById('tAlt3TimerOmregnetVis').innerText = "0";
        
        const mAlt3Tillegg = document.getElementById('mAlt3TilleggTekst');
        if (mAlt3Tillegg) mAlt3Tillegg.style.display = 'none';

        const bTillegg = document.getElementById('tAlt3TilleggBoks');
        if (bTillegg) bTillegg.style.display = 'none';
        
        const tAlt3LonnTekst = document.getElementById('tAlt3LonnTekst');
        if (tAlt3LonnTekst) tAlt3LonnTekst.innerText = "Ingen utbetaling.";

        if (typeof oppdaterStartsideKnapper === 'function') oppdaterStartsideKnapper();
        if (typeof oppdaterStegIndikatorer === 'function' && typeof aktivtSteg !== 'undefined') oppdaterStegIndikatorer(aktivtSteg);
        return;
    }

    const start = new Date(startInputStr);
    const slutt = new Date(sluttInputStr);
    const diffMs = slutt - start;
    if (diffMs <= 0 || isNaN(diffMs)) return;

    const totalTimer = diffMs / (1000 * 60 * 60);
    const heleDogn = Math.floor(totalTimer / 24);
    const restTimer = totalTimer % 24;
    let tellendeDogn = heleDogn + (restTimer >= 3 ? 1 : 0);

    let totalDognKronsum = 0;
    let sjablongDogn = 0;
    let turNavn = "";
    let beskrivelseDogn = "";

    if (turType === 'eks1' || turType === 'eks2') { 
        totalDognKronsum = tellendeDogn * GRUNNSATSER.dognsats.del1; 
        turNavn = "Del I: Dagarbeidstaker (Faktisk)"; 
        beskrivelseDogn = `${tellendeDogn} døgn à kr ${GRUNNSATSER.dognsats.del1.toLocaleString('no-NO')}`;
    } else {
        const erLeirskole = (turType === 'eks3');
        const satser = erLeirskole ? GRUNNSATSER.dognsats.del2Leirskole : GRUNNSATSER.dognsats.del2Utland;
        sjablongDogn = erLeirskole ? GRUNNSATSER.sjablongTimer.leirskole : GRUNNSATSER.sjablongTimer.utland;
        turNavn = erLeirskole ? "Del II: Bemannet leirskole" : "Del II: Utenlandstur";

        let antHverdag = 0;
        let antHelg = 0;
        let tempDato = new Date(start);

        for (let i = 0; i < tellendeDogn; i++) {
            const ukedag = tempDato.getDay();
            if (ukedag === 0 || ukedag === 6) {
                antHelg++;
            } else {
                antHverdag++;
            }
            tempDato.setDate(tempDato.getDate() + 1);
        }

        const hverdagSats = typeof satser === 'object' ? satser.hverdag : satser;
        const helgSats = typeof satser === 'object' ? satser.helg : satser;

        totalDognKronsum = (antHverdag * hverdagSats) + (antHelg * helgSats);

        if (antHelg > 0 && typeof satser === 'object') {
            beskrivelseDogn = `${antHverdag}d hvd (${hverdagSats},-) + ${antHelg}d helg (${helgSats},-)`;
        } else {
            beskrivelseDogn = `${tellendeDogn} døgn à kr ${hverdagSats.toLocaleString('no-NO')}`;
        }
    }

    if (document.getElementById('conType')) document.getElementById('conType').innerText = turNavn;
    if (document.getElementById('conStilling')) document.getElementById('conStilling').innerText = stillingsType === '100' ? "100 % Fast stilling (Overtidsberettiget)" : "Deltid / merarbeidstakst";

    if (document.getElementById('resDognSum')) document.getElementById('resDognSum').innerText = `kr ${totalDognKronsum.toLocaleString('no-NO')},–`;
    if (document.getElementById('resVarighet')) document.getElementById('resVarighet').innerText = `${heleDogn}d og ${restTimer.toFixed(1)}t`;
    if (document.getElementById('conVarighet')) document.getElementById('conVarighet').innerText = `${heleDogn}d ${restTimer.toFixed(0)}t`;
    if (document.getElementById('conStart')) document.getElementById('conStart').innerText = start.toLocaleString('no-NO', {dateStyle:'short', timeStyle:'short'});
    if (document.getElementById('conSlutt')) document.getElementById('conSlutt').innerText = slutt.toLocaleString('no-NO', {dateStyle:'short', timeStyle:'short'});

    if (document.getElementById('conDognBeregning')) document.getElementById('conDognBeregning').innerText = beskrivelseDogn;
    if (document.getElementById('conDognTotal')) document.getElementById('conDognTotal').innerText = totalDognKronsum.toLocaleString('no-NO');

    const timelonnUndervisning = arslonn 
        ? ((arslonn * GRUNNSATSER.formelFaktorer.faktor1 * GRUNNSATSER.formelFaktorer.faktor2) / 
           (GRUNNSATSER.skoleAar.undervisningsTimerAar * GRUNNSATSER.formelFaktorer.faktor3 * GRUNNSATSER.formelFaktorer.faktor4)) 
        : 0;
    
    const timelonnTilstedevaerelse = arslonn ? (arslonn / GRUNNSATSER.skoleAar.arsverkTotalTimer) : 0;
    
    const timerUndervisningPerDag = GRUNNSATSER.skoleAar.undervisningsTimerAar / GRUNNSATSER.skoleAar.skoledagerAar;
    const timerTilstedevaerelsePerDag = (GRUNNSATSER.skoleAar.tilstedevaerelseAar - GRUNNSATSER.skoleAar.undervisningsTimerAar) / GRUNNSATSER.skoleAar.skoledagerAar;
    const lengdeVektetArbeidsdag = timerUndervisningPerDag + timerTilstedevaerelsePerDag;

    const kostnadPerFridag = (timerUndervisningPerDag * timelonnUndervisning) + (timerTilstedevaerelsePerDag * timelonnTilstedevaerelse);
    const antallAvspaseringsdagerFraDognsats = kostnadPerFridag > 0 ? (totalDognKronsum / kostnadPerFridag) : 0;

    let totalGodskrevet = 0;
    if (turType === 'eks1' || turType === 'eks2') { 
        totalGodskrevet = faktiskTid; 
    } else { 
        totalGodskrevet = (heleDogn * sjablongDogn) + ((restTimer / 24) * sjablongDogn); 
    }
    
    let nettoTimer = totalGodskrevet - ordinarTid;

    if (document.getElementById('resNettoTimerVisning')) document.getElementById('resNettoTimerVisning').innerText = `${nettoTimer.toFixed(1)} timer`;
    if (document.getElementById('conGodskrevet')) document.getElementById('conGodskrevet').innerText = totalGodskrevet.toFixed(1);
    if (document.getElementById('conNetto')) document.getElementById('conNetto').innerText = nettoTimer.toFixed(1);

    let fridagerFraPlusstimer = (nettoTimer > 0 && lengdeVektetArbeidsdag > 0) ? (nettoTimer / lengdeVektetArbeidsdag) : 0;
    let samletFritidDager = antallAvspaseringsdagerFraDognsats + fridagerFraPlusstimer;

    let overtidFaktor = stillingsType === '100' ? GRUNNSATSER.overtid.fullStillingTillegg : GRUNNSATSER.overtid.deltidTillegg;
    let satsPlusstimer = timelonnTilstedevaerelse * overtidFaktor;
    let satsKunTillegg = timelonnTilstedevaerelse * GRUNNSATSER.overtid.kunTilleggProsentsats;

    const kronePlusstimerFull = nettoTimer > 0 ? (nettoTimer * satsPlusstimer) : 0;
    const kroneKunTillegg = nettoTimer > 0 ? (nettoTimer * satsKunTillegg) : 0;

    const mAlt1Lonn = document.getElementById('mAlt1Lonn');
    if (mAlt1Lonn) mAlt1Lonn.innerText = totalDognKronsum.toLocaleString('no-NO');
    const mAlt1Timer = document.getElementById('mAlt1Timer');
    if (mAlt1Timer) mAlt1Timer.innerText = nettoTimer.toFixed(1);

    const mAlt2Sats = document.getElementById('mAlt2Sats');
    if (mAlt2Sats) mAlt2Sats.innerText = totalDognKronsum.toLocaleString('no-NO');
    const mAlt2Overtid = document.getElementById('mAlt2Overtid');
    if (mAlt2Overtid) mAlt2Overtid.innerText = Math.round(kronePlusstimerFull).toLocaleString('no-NO');
    const mAlt2Total = document.getElementById('mAlt2Total');
    if (mAlt2Total) mAlt2Total.innerText = Math.round(totalDognKronsum + kronePlusstimerFull).toLocaleString('no-NO');

    const mAlt3SamletDager = document.getElementById('mAlt3SamletDager');
    if (mAlt3SamletDager) mAlt3SamletDager.innerText = samletFritidDager.toFixed(2);
    const mAlt3DagerVis = document.getElementById('mAlt3DagerVis');
    if (mAlt3DagerVis) mAlt3DagerVis.innerText = antallAvspaseringsdagerFraDognsats.toFixed(2);
    const mAlt3TimerOmregnetVis = document.getElementById('mAlt3TimerOmregnetVis');
    if (mAlt3TimerOmregnetVis) mAlt3TimerOmregnetVis.innerText = fridagerFraPlusstimer.toFixed(2);

    const mAlt3Tillegg = document.getElementById('mAlt3TilleggTekst');
    if (stillingsType === '100' && nettoTimer > 0 && arslonn > 0) {
        if (mAlt3Tillegg) mAlt3Tillegg.style.display = 'inline';
        const mAlt3Kroner = document.getElementById('mAlt3TilleggKroner');
        if (mAlt3Kroner) mAlt3Kroner.innerText = Math.round(kroneKunTillegg).toLocaleString('no-NO');
    } else {
        if (mAlt3Tillegg) mAlt3Tillegg.style.display = 'none';
    }

    if (document.getElementById('tAlt1Lonn')) document.getElementById('tAlt1Lonn').innerText = totalDognKronsum.toLocaleString('no-NO');
    if (document.getElementById('tAlt1Timer')) document.getElementById('tAlt1Timer').innerText = nettoTimer.toFixed(1);

    if (document.getElementById('tAlt2Sats')) document.getElementById('tAlt2Sats').innerText = totalDognKronsum.toLocaleString('no-NO');
    if (document.getElementById('tAlt2Overtid')) document.getElementById('tAlt2Overtid').innerText = Math.round(kronePlusstimerFull).toLocaleString('no-NO');
    if (document.getElementById('tAlt2Total')) document.getElementById('tAlt2Total').innerText = Math.round(totalDognKronsum + kronePlusstimerFull).toLocaleString('no-NO');

    if (document.getElementById('tAlt3SamletSamling')) document.getElementById('tAlt3SamletSamling').innerText = samletFritidDager.toFixed(2);
    if (document.getElementById('tAlt3DagerVis')) document.getElementById('tAlt3DagerVis').innerText = antallAvspaseringsdagerFraDognsats.toFixed(2);
    if (document.getElementById('tAlt3TimerOmregnetVis')) document.getElementById('tAlt3TimerOmregnetVis').innerText = fridagerFraPlusstimer.toFixed(2);

    const bTillegg = document.getElementById('tAlt3TilleggBoks');
    if (stillingsType === '100' && nettoTimer > 0 && arslonn > 0) {
        if (bTillegg) bTillegg.style.display = 'block';
        if (document.getElementById('tAlt3TilleggKroner')) document.getElementById('tAlt3TilleggKroner').innerText = Math.round(kroneKunTillegg).toLocaleString('no-NO');
        if (document.getElementById('tAlt3LonnTekst')) document.getElementById('tAlt3LonnTekst').innerText = "Døgngodtgjørelse avspaseres.";
    } else {
        if (bTillegg) bTillegg.style.display = 'none';
        if (document.getElementById('tAlt3LonnTekst')) document.getElementById('tAlt3LonnTekst').innerText = "Ingen utbetaling.";
    }

    if (typeof oppdaterStartsideKnapper === 'function') oppdaterStartsideKnapper();
    if (typeof oppdaterStegIndikatorer === 'function' && typeof aktivtSteg !== 'undefined') oppdaterStegIndikatorer(aktivtSteg);
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof lastInnSisteUtkast === 'function') lastInnSisteUtkast();
    if (typeof lastInnSkoleProfil === 'function') lastInnSkoleProfil();
    if (typeof toggleTurTypeFields === 'function') toggleTurTypeFields();
    if (typeof genererDagerTabell === 'function') genererDagerTabell();
    
    beregnAlt();
    
    if (typeof gaaTilSteg === 'function') gaaTilSteg(0);

    // --- Koble opp SGS 1010 modal/lenke fra side 0 ---
    const openBtn = document.getElementById('openSGS1010Btn');
    const modal = document.getElementById('sgsModal');
    const closeBtn = document.getElementById('closeSgsModalBtn');
    const content = document.getElementById('sgsModalContent');

    if (openBtn && modal && content) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof getSGS1010HTML === 'function') {
                content.innerHTML = getSGS1010HTML();
                modal.style.display = 'flex';
            }
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Lyttere for å tilbakestille Steg 4-godkjenning ved endring i skjemaet i ettertid
    const felter = ['skoleNavn', 'ansattNavn', 'arslonn', 'startTid', 'sluttTid', 'faktiskTid'];
    felter.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (typeof nullstillSteg4Fullfoering === 'function') nullstillSteg4Fullfoering();
            });
            el.addEventListener('change', () => {
                if (typeof nullstillSteg4Fullfoering === 'function') nullstillSteg4Fullfoering();
            });
        }
    });
});