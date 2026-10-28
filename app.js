const ukedager = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
let aktivtSteg = 0;

// ==========================================
// 1. STEG-NAVIGASJON & STARTLOGIKK
// ==========================================
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

    if (stegNummer === 0) {
        oppdaterStartsideKnapper();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nesteSteg() { gaaTilSteg(aktivtSteg + 1); }
function forrigeSteg() { gaaTilSteg(aktivtSteg - 1); }

function erSkjemaUtfylt() {
    const ansatt = document.getElementById('ansattNavn')?.value.trim();
    const arslonn = document.getElementById('arslonn')?.value.trim();
    const start = document.getElementById('startTid')?.value;
    const slutt = document.getElementById('sluttTid')?.value;
    
    // Sjekk om det finnes et lagret utkast i localStorage som har navn, lønn eller dato
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
    
    // 1. Tøm alle felter
    document.getElementById('ansattNavn').value = '';
    document.getElementById('arslonn').value = '';
    document.getElementById('startTid').value = '';
    document.getElementById('sluttTid').value = '';
    document.getElementById('faktiskTid').value = '0';
    document.getElementById('stillingsprosent').value = '100';
    document.getElementById('turType').value = 'eks3';
    
    // 2. Tøm timeplan
    const tbody = document.getElementById('dagerTbody');
    if (tbody) tbody.innerHTML = '';

    // 3. Slett lagret utkast
    localStorage.removeItem('leirskole_siste_utkast');
    
    // 4. Oppdater grensesnitt, knapper og beregninger
    toggleTurTypeFields();
    beregnAlt();

    // 5. Gå til Steg 1
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

// LAGRINGSMODAL OG OVERSKRIVING LOGIKK
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
    lukkLagreModal();

    if (aksjonEtterLagring === 'ny') {
        // Tøm alle tekst- og datofelter
        document.getElementById('ansattNavn').value = '';
        document.getElementById('arslonn').value = '';
        document.getElementById('startTid').value = '';
        document.getElementById('sluttTid').value = '';
        document.getElementById('faktiskTid').value = '0';
        document.getElementById('stillingsprosent').value = '100';
        document.getElementById('turType').value = 'eks3';
        
        // Tøm timeplan-tabellen fullstendig
        const tbody = document.getElementById('dagerTbody');
        if (tbody) tbody.innerHTML = '';

        // Fjern lagret utkast fra localStorage
        localStorage.removeItem('leirskole_siste_utkast');

        // Oppdater visning og gjør en ren null-beregning
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
// SKOLEPROFIL OG LOGO LOGIKK
// ==========================================
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
        localStorage.setItem('leirskole_logo', base64Image);
        oppdaterSkoleVisning();
    };
    reader.readAsDataURL(file);
}

function fjernLogo() {
    localStorage.removeItem('leirskole_logo');
    const input = document.getElementById('skoleLogoInput');
    if (input) input.value = '';
    oppdaterSkoleVisning();
}

function lagreSkoleProfil() {
    const profil = {
        gate: document.getElementById('skoleGateInput')?.value || '',
        post: document.getElementById('skolePostInput')?.value || '',
        org: document.getElementById('skoleOrgInput')?.value || '',
        tlf: document.getElementById('skoleTlfInput')?.value || '',
        epost: document.getElementById('skoleEpostInput')?.value || '',
        web: document.getElementById('skoleWebInput')?.value || ''
    };
    localStorage.setItem('leirskole_skoleprofil', JSON.stringify(profil));
    oppdaterSkoleVisning();
}

function lastInnSkoleProfil() {
    try {
        const profil = JSON.parse(localStorage.getItem('leirskole_skoleprofil'));
        if (profil) {
            if (document.getElementById('skoleGateInput')) document.getElementById('skoleGateInput').value = profil.gate || '';
            if (document.getElementById('skolePostInput')) document.getElementById('skolePostInput').value = profil.post || '';
            if (document.getElementById('skoleOrgInput')) document.getElementById('skoleOrgInput').value = profil.org || '';
            if (document.getElementById('skoleTlfInput')) document.getElementById('skoleTlfInput').value = profil.tlf || '';
            if (document.getElementById('skoleEpostInput')) document.getElementById('skoleEpostInput').value = profil.epost || '';
            if (document.getElementById('skoleWebInput')) document.getElementById('skoleWebInput').value = profil.web || '';
        }
    } catch(e) {}
    oppdaterSkoleVisning();
}

function oppdaterSkoleVisning() {
    const skoleNavn = document.getElementById('skoleNavn')?.value || 'Skole/Virksomhet';
    const profil = JSON.parse(localStorage.getItem('leirskole_skoleprofil') || '{}');
    const logoBase64 = localStorage.getItem('leirskole_logo');

    // Venstre side i bunnteksten
    const conFooterSkole = document.getElementById('conFooterSkole');
    if (conFooterSkole) conFooterSkole.innerText = skoleNavn;
    
    const conFooterOrg = document.getElementById('conFooterOrg');
    if (conFooterOrg) conFooterOrg.innerText = profil.org ? `(${profil.org})` : '';

    const conFooterAdresse = document.getElementById('conFooterAdresse');
    if (conFooterAdresse) {
        const adrKomplett = [profil.gate, profil.post].filter(Boolean).join(' / ');
        conFooterAdresse.innerText = adrKomplett;
    }

    const conFooterTlf = document.getElementById('conFooterTlf');
    if (conFooterTlf) conFooterTlf.innerText = profil.tlf ? `Tlf: ${profil.tlf}` : '';

    // Høyre side i bunnteksten
    const conFooterEpost = document.getElementById('conFooterEpost');
    if (conFooterEpost) conFooterEpost.innerText = profil.epost || '';

    const conFooterWeb = document.getElementById('conFooterWeb');
    if (conFooterWeb) conFooterWeb.innerText = profil.web || '';

    // Logo
    const conLogoVisning = document.getElementById('conLogoVisning');
    const conLogoImg = document.getElementById('conLogoImg');
    const logoPreviewContainer = document.getElementById('logoPreviewContainer');
    const logoPreviewImg = document.getElementById('logoPreviewImg');

    if (logoBase64) {
        if (conLogoImg) conLogoImg.src = logoBase64;
        if (conLogoVisning) conLogoVisning.style.display = 'block';
        if (logoPreviewImg) logoPreviewImg.src = logoBase64;
        if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
    } else {
        if (conLogoVisning) conLogoVisning.style.display = 'none';
        if (logoPreviewContainer) logoPreviewContainer.style.display = 'none';
    }
}



function beregnAlt() {
    lagreAktivTilStorage();
    
    const startInputStr = document.getElementById('startTid').value;
    const sluttInputStr = document.getElementById('sluttTid').value;
    const valgtModell = document.querySelector('input[name="oppgjorsModell"]:checked')?.value || 'alt1';
    
    oppdaterValgtModellVisning(valgtModell);

    document.getElementById('conNavn').innerText = document.getElementById('ansattNavn').value || "-";
    document.getElementById('conSkole').innerText = document.getElementById('skoleNavn').value || "-";
    document.getElementById('conGjelderAar').innerText = GRUNNSATSER.gjelderAar;
    
    const ordinarTid = beregnOrdinatTidFraTabell();
    const turType = document.getElementById('turType').value;
    const stillingsType = document.getElementById('stillingsprosent').value;
    const faktiskTid = parseFloat(document.getElementById('faktiskTid').value) || 0;
    
    const arslonnRaw = document.getElementById('arslonn').value.replace(/\s/g, '');
    const arslonn = parseFloat(arslonnRaw) || 0;

    if (arslonn > 0) {
        document.getElementById('conArslonn').innerText = `kr ${arslonn.toLocaleString('no-NO')},-`;
    } else {
        document.getElementById('conArslonn').innerText = "-";
    }

    document.getElementById('conOrdinar').innerText = ordinarTid.toFixed(1);
    
    if (!startInputStr || !sluttInputStr) {
        document.getElementById('resVarighet').innerText = "-";
        document.getElementById('resDognSum').innerText = "0,-";
        document.getElementById('resNettoTimerVisning').innerText = "0 timer";
        document.getElementById('conVarighet').innerText = "-";
        document.getElementById('conStart').innerText = "-";
        document.getElementById('conSlutt').innerText = "-";
        document.getElementById('conDognBeregning').innerText = "-";
        document.getElementById('conDognTotal').innerText = "0";
        document.getElementById('conGodskrevet').innerText = "0.0";
        document.getElementById('conNetto').innerText = "0.0";
        return;
    }

    const start = new Date(startInputStr);
    const slutt = new Date(sluttInputStr);
    const diffMs = slutt - start;
    if(diffMs <= 0 || isNaN(diffMs)) return;

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

    document.getElementById('conType').innerText = turNavn;
    document.getElementById('conStilling').innerText = stillingsType === '100' ? "100 % Fast stilling (Overtidsberettiget)" : "Deltid / merarbeidstakst";

    document.getElementById('resDognSum').innerText = `kr ${totalDognKronsum.toLocaleString('no-NO')},–`;
    document.getElementById('resVarighet').innerText = `${heleDogn}d og ${restTimer.toFixed(1)}t`;
    document.getElementById('conVarighet').innerText = `${heleDogn}d ${restTimer.toFixed(0)}t`;
    document.getElementById('conStart').innerText = start.toLocaleString('no-NO', {dateStyle:'short', timeStyle:'short'});
    document.getElementById('conSlutt').innerText = slutt.toLocaleString('no-NO', {dateStyle:'short', timeStyle:'short'});

    document.getElementById('conDognBeregning').innerText = beskrivelseDogn;
    document.getElementById('conDognTotal').innerText = totalDognKronsum.toLocaleString('no-NO');

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
    if(turType==='eks1'||turType==='eks2') { 
        totalGodskrevet = faktiskTid; 
    } else { 
        totalGodskrevet = (heleDogn * sjablongDogn) + ((restTimer / 24) * sjablongDogn); 
    }
    
    let nettoTimer = totalGodskrevet - ordinarTid;

    document.getElementById('resNettoTimerVisning').innerText = `${nettoTimer.toFixed(1)} timer`;
    document.getElementById('conGodskrevet').innerText = totalGodskrevet.toFixed(1);
    document.getElementById('conNetto').innerText = nettoTimer.toFixed(1);

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

    document.getElementById('tAlt1Lonn').innerText = totalDognKronsum.toLocaleString('no-NO');
    document.getElementById('tAlt1Timer').innerText = nettoTimer.toFixed(1);

    document.getElementById('tAlt2Sats').innerText = totalDognKronsum.toLocaleString('no-NO');
    document.getElementById('tAlt2Overtid').innerText = Math.round(kronePlusstimerFull).toLocaleString('no-NO');
    document.getElementById('tAlt2Total').innerText = Math.round(totalDognKronsum + kronePlusstimerFull).toLocaleString('no-NO');

    document.getElementById('tAlt3SamletSamling').innerText = samletFritidDager.toFixed(2);
    document.getElementById('tAlt3DagerVis').innerText = antallAvspaseringsdagerFraDognsats.toFixed(2);
    document.getElementById('tAlt3TimerOmregnetVis').innerText = fridagerFraPlusstimer.toFixed(2);

const bTillegg = document.getElementById('tAlt3TilleggBoks');
    if (stillingsType === '100' && nettoTimer > 0 && arslonn > 0) {
        if (bTillegg) bTillegg.style.display = 'block';
        document.getElementById('tAlt3TilleggKroner').innerText = Math.round(kroneKunTillegg).toLocaleString('no-NO');
        document.getElementById('tAlt3LonnTekst').innerText = "Døgngodtgjørelse avspaseres.";
    } else {
        if (bTillegg) bTillegg.style.display = 'none';
        document.getElementById('tAlt3LonnTekst').innerText = "Ingen utbetaling.";
    }

    // LEGG TIL DENNE FOR Å OPPDATERE KNAPPENE PÅ STARTSIDEN DYNAMISK
    oppdaterStartsideKnapper();
}

window.addEventListener('DOMContentLoaded', () => {
    lastInnSisteUtkast();
    lastInnSkoleProfil(); // Laster inn lagret skoleprofil og logo
    toggleTurTypeFields();
    genererDagerTabell();
    beregnAlt();
    gaaTilSteg(0);
});