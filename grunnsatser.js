/**
 * GRUNNSATSER OG KONSTANTER FOR LEIRSKOLEBEREGNING (SGS 1010 / SFS 2213)
 * Oppdatert i henhold til SGS 1010 for perioden 01.01.2026–31.12.2028.
 */

const GRUNNSATSER = {
    // Tariff-periode og sist oppdatert
    gjelderAar: "2026–2028",
    sistOppdatert: "01.01.2026",

    // Standard rammetid for planfestet tid på skolen (1 = Mandag ... 5 = Fredag)
    standardRammetid: {
        1: { start: "08:15", slutt: "15:00" }, // Mandag
        2: { start: "08:15", slutt: "15:30" }, // Tirsdag
        3: { start: "08:15", slutt: "15:30" }, // Onsdag
        4: { start: "08:15", slutt: "14:30" }, // Torsdag
        5: { start: "08:15", slutt: "14:00" }  // Fredag
    },

    // Døgngodtgjørelser (SGS 1010) i kr
    dognsats: {
        del1: 550, // Dagarbeidstaker / Turnusarbeidstaker (Faktisk tid)
        
        // Bemannet leirskole (Del II A - 9t/døgn)
        del2Leirskole: {
            hverdag: 1610,
            helg: 1970,    // Lørdag / Søndag
            hoytid: 2050   // Helge- og høytidsdager
        },

        // Utenlandstur m/ped.ansvar (Del II B - 12t/døgn)
        del2Utland: {
            hverdag: 2030,
            helg: 2400,    // Lørdag / Søndag
            hoytid: 2650   // Helge- og høytidsdager
        }
    },

    // Sjablongtimer per døgn (Del II)
    sjablongTimer: {
        leirskole: 9,
        utland: 12
    },

    // Skoletid / Årsrammer (SFS 2213)
    skoleAar: {
        undervisningsTimerAar: 741,    // Årsramme undervisning
        tilstedevaerelseAar: 1150,     // Total tilstedeværelse på skolen (årsverk)
        skoledagerAar: 190,            // Antall skoledager per år
        arsverkTotalTimer: 1950        // Standard årsverk timer (for timelønn tilstedeværelse)
    },

    // Formel-faktorer for timelønn undervisning (HTA)
    formelFaktorer: {
        faktor1: 1400,
        faktor2: 100,
        faktor3: 1687.5,
        faktor4: 112
    },

    // Overtidstillegg prosentsatser
    overtid: {
        fullStillingTillegg: 1.5,   // 100% stilling (150% lønn)
        deltidTillegg: 1.0,         // Deltid (100% lønn / merarbeid)
        kunTilleggProsentsats: 0.5   // 50% overtidstillegg ved avspasering
    }
};