/*
 * Etumerkintäkoodit: Trafikverket, "Tecken och koder vid utsättning av
 * vägmarkering" (2015-02-24), Kod-rivi ja "Exempel på kodutsättning".
 *
 * Yksiköt kortin mukaan: kort = 1 (0,5 m), lång = 3 (1,5 m), uppehåll = 1 (0,5 m).
 * y kasvaa ajosuuntaan (ruudulla ylös). Sarake 0 = vasen, 1 = oikea,
 * 0.5 = keskellä (yksi sarake). Rivi = [sarake, y, pituus].
 *
 * Kuviot on kuvattu OMISTAJAN ajosuunnassa: Höger-kanavalla NVDB-suunta,
 * Vänster-kanavalla vastasuunta, keskiviivalla NVDB-suunta. Vastakkaiseen
 * suuntaan ajettaessa sama maalattu kuvio näkyy 180 astetta käännettynä.
 * Todennettu kortista: "Vänsterspärr börjar" = "Högerspärr slutar" käännettynä.
 */
(function (global) {
  "use strict";
  var H = 5;
  var CODES = {
    SOLID_B: [[0, 0, 1], [1, 0, 3]],                       // Högerspärr börjar
    SOLID_S: [[1, 0, 3], [0, 2, 1]],                       // Högerspärr slutar
    FORV_B:  [[0, 0, 1], [1, 0, 1], [1, 2, 3]],            // Varning före spärr börjar
    FORV_S:  [[1, 0, 3], [0, 4, 1], [1, 4, 1]],            // Varning före spärr slutar
    WARN_B:  [[0.5, 0, 1], [0.5, 2, 3]],                   // Varningslinje börjar
    WARN_S:  [[0.5, 0, 3], [0.5, 4, 1]],                   // Varningslinje slutar
    TAT_B:   [[0, 0, 1], [1, 0, 1], [1, 2, 1], [1, 4, 1]], // 3+3 börjar
    // 3+3 slutar Kod-taulukon mukaan (kolme lyhyttä vasemmalla, yksi oikealla
    // lopussa) = börjar käännettynä. Kortin esimerkkikuva piirtää yksittäiset
    // lyhyet oikeaan sarakkeeseen; taulukko on määritelmä, ristiriita kirjattu.
    TAT_S:   [[0, 0, 1], [0, 2, 1], [0, 4, 1], [1, 4, 1]]  // 3+3 slutar
  };

  function height(code) {
    return CODES[code].reduce(function (a, r) { return Math.max(a, r[1] + r[2]); }, 0);
  }

  // 180 astetta: sarake peilautuu ja y kääntyy koodin oman korkeuden sisällä.
  function rects(code, rotate) {
    var hc = height(code);
    return CODES[code].map(function (r) {
      return rotate ? [1 - r[0], hc - (r[1] + r[2]), r[2]] : r.slice();
    });
  }

  // Laatikko s x s, palauttaa [x, y, w, h] piirtokoordinaateissa (y alaspäin).
  function layout(code, rotate, s) {
    var unit = s * 0.84 / H, colW = unit * 0.9, gap = unit * 0.55, hc = height(code);
    var top = (s - hc * unit) / 2;
    return rects(code, rotate).map(function (r) {
      var x = r[0] === 0.5 ? (s - colW) / 2 : (r[0] === 0 ? s / 2 - gap / 2 - colW : s / 2 + gap / 2);
      return [x, top + (hc - (r[1] + r[2])) * unit, colW, r[2] * unit];
    });
  }

  global.Codes = { CODES: CODES, height: height, rects: rects, layout: layout };
})(typeof window !== "undefined" ? window : globalThis);
