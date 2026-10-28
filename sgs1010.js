/**
 * sgs1010.js - Fullstendig datastruktur og visningsmotor for SGS 1010
 */

const sgs1010Data = {
    title: "SGS 1010 – Særavtale for reiser, leirskoler og utlandsturer",
    period: "01.01.2026 – 31.12.2028",
    sections: [
        {
            num: "1",
            title: "Hjemmel",
            content: "Denne særavtalen er inngått med hjemmel i Hovedavtalen del A § 4-3 og arbeidsmiljølovens (aml) kapittel 10.\n\nHovedtariffavtalens (HTA) bestemmelser og sentrale særavtaler gjelder, med mindre noe annet er regulert i denne avtalen."
        },
        {
            num: "2",
            title: "Avtalens omfang, ikrafttreden og varighet",
            content: "Avtalen omfatter bl.a. overnattingsturer og ferieturer for brukere i helse- og omsorgstjenesten, psykisk helsevern, barnevern, barnehage, kulturskole og skole samt reise til sykehus, institusjon o.l. Avtalen gjelder for turer både ved bemannede og ubemannede institusjoner. Særavtalen gjelder for arbeidstakere omfattet av HTA/Bedriftsavtalen – Hovedtariffavtale for selvstendige bedrifter i kommunal sektor.\n\nAvtalen har egne bestemmelser for undervisningspersonale for reiser med elever til/fra og opphold på bemannede leirskoler (del II A), samt ved utenlandsturer (del II B).\n\nAvtalen gjelder for perioden 1.1.2026-31.12.2028.\n\nSæravtalen må sies opp skriftlig med minst tre - 3 - måneders varsel før utløpstid. Dersom avtalen ikke er sagt opp av noen av partene innen fristens utløp, fornyes avtalen for ett år av gangen med samme gjensidige oppsigelsesfrist."
        },
        {
            num: "3",
            title: "Arbeidsplan",
            content: "Det skal på forhånd utarbeides en arbeidsplan for turen.\n\nFor undervisningspersonalet skal arbeidsplanen og arbeidstiden være i samsvar med de aktuelle bestemmelser i SFS 2213."
        },
        {
            num: "4",
            title: "Lokal tilpasning",
            content: "For å dekke behovet for særlige tilpasninger i forhold til ulike typer opphold og tjenestebehov, kan det lages lokale tilpasningsavtaler. De lokale avtalene skal være i tråd med bestemmelsene i HTA og aml.\n\nDe lokale parter finner de løsninger som er mest hensiktsmessig for det enkelte oppholdet.\n\nDersom særlige behov gjør det nødvendig å fravike amls bestemmelser om arbeidstid pr. uke og/eller hviletidsbestemmelsene, vises det til aml kap. 10.\n\nDer hvor det er lokal enighet, kan også andre grupper tilknyttet skolen omfattes av undervisningspersonalets godtgjøringsbestemmelser, jf. del II A og B.\n\nFor undervisningspersonalet kan det inngås lokale tilpasningsavtaler med hjemmel i denne avtale."
        },
        {
            header: "Del I",
            num: "5",
            title: "Følge av pasient/klient/bruker/elev",
            subsections: [
                {
                    num: "5.1.1",
                    title: "Arbeidsplan",
                    content: "I arbeidsplanen skal den enkelte arbeidstakers arbeidstid (aktiv og passiv tid) på reisen tur/retur og under oppholdet fremkomme. Fritid på reisen og oppholdet skal også framkomme. Arbeidsplanen skal utarbeides i samarbeid med tillitsvalgte minimum 14 dager før turen."
                },
                {
                    num: "5.1.2",
                    title: "Reisetid",
                    content: "Reisetid regnes som arbeidstid i det tidsrom arbeidstakeren har tilsyn med pasient/klient/bruker/elev. Tid hvor arbeidstaker ikke har tilsyn er fritid, og kompenseres i henhold til avtalens pkt. 5.2 a)."
                },
                {
                    num: "5.1.3",
                    title: "Gjennomsnittsberegning av arbeidstiden",
                    content: "Arbeidsgiver og tillitsvalgte avtaler gjennomsnittsberegning av arbeidstiden. Det kan avtales vakter på inntil 10 timer.\n\nVakter på inntil 16 timer kan avtales, forutsatt at timer utover 10 timer er av passiv karakter. Alle timene betales med ordinær timelønn (1:1)*, jf. 5.2 b) siste setning.\n\nAntall arbeidstimer i arbeidsplanen som overstiger arbeidstiden i den ansattes ordinære turnus, kommer til utbetaling time for time med ordinær timelønn.\n\nVed enighet kan timene helt eller delvis avspaseres. Eventuelle ubekvemstillegg etter HTA kap.1 § 5 utbetales.\n\nPålagt arbeid ut over arbeidsplanen for turen betales i henhold til HTA kap. 1 § 6.\n\n* Ved ytelser etter HTA kap. 1 § 8 betales passiv tjeneste med ⅓ timelønn."
                },
                {
                    num: "5.2",
                    title: "Kompensasjon",
                    bullets: [
                        "<strong>a)</strong> Reisetid uten tilsyn kompenseres med ½ timelønn eller avspaseres etter avtale ut fra forholdet 1:2.",
                        "<strong>b)</strong> Passiv tjeneste betales med ⅓ timelønn (arbeidstid 1:1), med unntak av pkt. 5.1.3, annet avsnitt. Ved utrykning på vakt betales timelønn pluss 50 % for faktisk medgått tid per vakt avrundet til nærmeste halve time, jf. HTA kap. 1 § 4.3.1.3. Dette gjelder ikke passiv tjeneste som faller inn under pkt. 5.1.3, annet avsnitt.",
                        "<strong>c)</strong> Særskilt arbeidstid for vakter ut over ordinær arbeidsplan reguleres iht. HTA kap. 1 § 5 og kap. 3 pkt. 3.7."
                    ]
                },
                {
                    num: "5.3",
                    title: "Godtgjøring og utgiftsdekning",
                    bullets: [
                        "<strong>a)</strong> For den tiden reisen og oppholdet varer (samlet reise- og oppholdstid), gis arbeidstakeren et tillegg på minimum kr. 550,- per døgn. Påbegynt døgn over 6 timer, regnet fra reisens begynnelse, godtgjøres som fullt døgn. For mindre enn 6 timer gis ingen kompensasjon.",
                        "<strong>b)</strong> I tillegg gis eventuelle godtgjøringer og utgiftsdekning i henhold til SGS 1001. Alle godtgjøringer betales av kommunen. Eventuelle trygderefusjoner eller lignende forhold vedrørende reisen, gjøres opp direkte med kommunen."
                    ]
                },
                {
                    num: "5.4",
                    title: "Hviletid etter turens slutt",
                    content: "Før arbeidstaker tiltrer sin ordinære tjeneste skal vedkommende sikres arbeidsfri i henhold til aml § 10-8."
                },
                {
                    num: "5.5",
                    title: "Dagreiser med pasient/klient/bruker/elev",
                    content: "Pålagt arbeid ut over ordinær arbeidstid betales i henhold til HTA kap. 1 § 6. Hjemreise uten pasient ut over ordinær arbeidstid godtgjøres med ½ timelønn.\n\nVed behov for overnatting uten pasient, gis det utgiftsdekning i henhold til SGS 1001."
                }
            ]
        },
        {
            header: "Del II A",
            num: "6",
            title: "Bestemmelser for undervisningspersonale ved reise til/fra og opphold ved bemannet leirskole",
            subsections: [
                {
                    num: "6.1",
                    title: "Omfang",
                    content: "Bestemmelsene regulerer arbeidstid og godtgjøring for reise til/fra og opphold ved bemannet leirskole for grunnskolen etter opplæringsloven og gjelder undervisningspersonale som har ansvar for og deltar sammen med elevene, både under reisen og oppholdet.\n\nDet kan ikke kreves godtgjøring etter andre tariffbestemmelser for denne type reise og opphold."
                },
                {
                    num: "6.2",
                    title: "Arbeidstid",
                    content: "Medfølgende lærer godskrives 9 timer av planfestet arbeidstid for hvert hele døgn reisen/oppholdet varer, regnet fra reisens start. For deler av døgn utover dette tillegges et forholdsmessig timetall.\n\nGodskriving av undervisningstid innenfor oversikt/plan over arbeidstiden fastsettes lokalt, dog slik at dette minimum tilsvarer vedkommendes gjennomsnittlige undervisningsplikt."
                },
                {
                    num: "6.3",
                    title: "Godtgjøring",
                    content: "I tillegg til godskriving av arbeidstid tilstås medfølgende undervisningspersonale en daggodtgjøring for eventuelt arbeid utover godskrevet tid, ansvar, ulemper m.v. som følge av reisen og oppholdet.\n\nDaggodtgjøring pr. døgn/del av døgn over 3 timer eller mer, regnet fra fremreisens start til hjemreisens slutt:",
                    rates: [
                        { label: "Ordinære hverdager (mandag - fredag)", amount: "kr 1 610,-" },
                        { label: "Lørdager og søndager", amount: "kr 1 970,-" },
                        { label: "Helge- og høytidsdager", amount: "kr 2 050,-" }
                    ]
                },
                {
                    num: "6.4",
                    title: "Kostgodtgjørelse",
                    content: "Medfølgende undervisningspersonale omfattes av kostgodtgjørelse i henhold til SGS 1001 for reisen til og fra leirskolen og for eventuell diett som ikke blir dekket på leirskolen."
                },
                {
                    num: "6.5",
                    title: "Avspasering",
                    content: "I stedet for godtgjøring i henhold til pkt. 6.3 kan det på den enkelte skole fastsettes tid til avspasering. Slik fastsetting forutsetter enighet mellom skolens rektor og den enkelte lærer som har krav på godtgjøring i henhold til punkt 6.3, om den tid som skal avspaseres."
                }
            ]
        },
        {
            header: "Del II B",
            num: "7",
            title: "Bestemmelser for undervisningspersonale ved reiser utenlands med elever",
            subsections: [
                {
                    num: "7.1",
                    title: "Omfang",
                    content: "Bestemmelsene regulerer arbeidstid og godtgjøring ved reiser/opphold i utlandet i kommunenes/ fylkeskommunenes regi."
                },
                {
                    num: "7.2",
                    title: "Arbeidstid",
                    content: "Medfølgende lærer godskrives 12 timer av planfestet arbeidstid for hvert hele døgn reisen/oppholdet varer, regnet fra reisens start. For deler av døgn utover dette tillegges et forholdsmessig timetall.\n\nGodskriving av undervisningstid innenfor oversikt/plan over arbeidstiden fastsettes lokalt, dog slik at dette minimum tilsvarer vedkommendes gjennomsnittlige undervisningsplikt."
                },
                {
                    num: "7.3",
                    title: "Godtgjøring",
                    content: "I tillegg til godskriving av arbeidstid tilstås medfølgende undervisningspersonale en daggodtgjøring for eventuelt arbeid utover godskrevet tid, ansvar, ulemper m.v. som følge av reisen og oppholdet.\n\nDaggodtgjøring pr. døgn/del av døgn over 3 timer eller mer, regnet fra fremreisens start til hjemreisens slutt:",
                    rates: [
                        { label: "Ordinære hverdager (mandag – fredag)", amount: "kr 2 030,-" },
                        { label: "Lørdager og søndager", amount: "kr 2 400,-" },
                        { label: "Helge- og høytidsdager", amount: "kr 2 650,-" }
                    ]
                },
                {
                    num: "7.4",
                    title: "Kostgodtgjørelse",
                    content: "Medfølgende undervisningspersonale omfattes av kostgodtgjørelse i henhold til SGS 1001 for reisen til/fra utlandet og eventuell diett som ikke blir dekket av arbeidsgiver."
                },
                {
                    num: "7.5",
                    title: "Avspasering",
                    content: "I stedet for godtgjøring i henhold til pkt. 7.3 kan det på den enkelte skole fastsettes tid til avspasering. Slik fastsetting forutsetter enighet mellom skolens rektor og den enkelte lærer som har krav på godtgjøring i henhold til punkt 7.3 om den tid som skal avspaseres."
                }
            ]
        }
    ]
};

/**
 * Genererer komplett, stilren HTML fra sgs1010Data til bruk i modaler eller lesevinduer
 */
function getSGS1010HTML() {
    let html = `<div class="sgs-container" style="line-height: 1.6; color: var(--text-primary, #f8fafc); font-family: inherit;">`;
    html += `<h2 style="color: var(--accent-blue, #38bdf8); margin-bottom: 0.3rem;">${sgs1010Data.title}</h2>`;
    html += `<p style="font-size: 0.85rem; color: var(--text-secondary, #94a3b8); margin-bottom: 1.5rem;"><strong>Gjeldeperiode:</strong> ${sgs1010Data.period}</p><hr style="border: 0; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); margin-bottom: 1.5rem;">`;

    sgs1010Data.sections.forEach(sec => {
        if (sec.header) {
            html += `<h3 style="color: var(--accent-indigo, #6366f1); border-bottom: 1px solid var(--accent-indigo, #6366f1); padding-bottom: 0.3rem; margin-top: 2rem; margin-bottom: 1rem;">${sec.header}</h3>`;
        }
        
        html += `<div style="margin-bottom: 1.2rem;">`;
        html += `<h4 style="font-size: 1.05rem; margin-bottom: 0.4rem;">${sec.num}. ${sec.title}</h4>`;
        
        if (sec.content) {
            html += `<p style="white-space: pre-line; margin-bottom: 0.5rem; font-size: 0.92rem; color: #cbd5e1;">${sec.content}</p>`;
        }

        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                html += `<div style="margin-left: 0.8rem; margin-top: 0.8rem; border-left: 2px solid var(--border-color, rgba(255,255,255,0.15)); padding-left: 0.8rem;">`;
                html += `<h5 style="font-size: 0.95rem; margin-bottom: 0.3rem; color: var(--accent-blue, #38bdf8);">${sub.num} ${sub.title}</h5>`;
                
                if (sub.content) {
                    html += `<p style="white-space: pre-line; font-size: 0.9rem; color: #cbd5e1;">${sub.content}</p>`;
                }

                if (sub.bullets) {
                    html += `<ul style="list-style: none; padding-left: 0; margin-top: 0.4rem;">`;
                    sub.bullets.forEach(b => {
                        html += `<li style="font-size: 0.9rem; margin-bottom: 0.4rem; color: #cbd5e1;">${b}</li>`;
                    });
                    html += `</ul>`;
                }

                if (sub.rates) {
                    html += `<table style="width: 100%; border-collapse: collapse; margin-top: 0.6rem; margin-bottom: 0.6rem; font-size: 0.88rem; background: rgba(15, 23, 42, 0.4); border-radius: 6px; overflow: hidden;">`;
                    sub.rates.forEach(r => {
                        html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.5rem 0.8rem; color: #cbd5e1;">${r.label}</td>
                            <td style="padding: 0.5rem 0.8rem; text-align: right; font-weight: 600; color: var(--accent-blue, #38bdf8);">${r.amount}</td>
                        </tr>`;
                    });
                    html += `</table>`;
                }
                html += `</div>`;
            });
        }
        html += `</div>`;
    });

    html += `</div>`;
    return html;
}