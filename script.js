const lukko = document.getElementById("lukittu");
// Näytetään aluksi pelkkä tiedonhaku palkki
lukko.style.display = "none";

const limited = [
  "AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOGL", "META", "NFLX", "JPM", "V",
  "BAC", "AMD", "PYPL", "DIS", "T", "PFE", "COST", "INTC", "KO", "TGT", "NKE",
  "SPY", "BA", "BABA", "XOM", "WMT", "GE", "CSCO", "VZ", "JNJ", "CVX", "PLTR",
  "SQ", "SHOP", "SBUX", "SOFI", "HOOD", "RBLX", "SNAP", "UBER", "FDX", "ABBV",
  "ETSY", "MRNA", "LMT", "GM", "F", "RIVN", "LCID", "CCL", "DAL", "UAL", "AAL",
  "TSM", "SONY", "ET", "NOK", "MRO", "COIN", "SIRI", "RIOT", "CPRX", "VWO",
  "SPYG", "ROKU", "VIAC", "ATVI", "BIDU", "DOCU", "ZM", "PINS", "TLRY", "WBA",
  "MGM", "NIO", "C", "GS", "WFC", "ADBE", "PEP", "UNH", "CARR", "FUBO", "HCA",
  "TWTR", "BILI", "RKT"
];

const logo = document.getElementById("logo");
const nimi = document.getElementById("nimi");

const symbol = document.getElementById("symbol");
const sector = document.getElementById("sector");
const porssi = document.getElementById("porssi");

const hinta = document.getElementById("hinta");

const info = document.getElementById("info");

const lomake = document.getElementById("lomake");
lomake.addEventListener('submit', function(e) {
    e.preventDefault(); // estää sivun latautumisen

    let syote = lomake.elements["kentta"].value.trim().toUpperCase();

    if (syote.length === 0) {
        alert("Kenttä ei voi olla tyhjä!");
        return;
    }

    // Näytetään loppuosa sivusta
    lukko.style.display = "block";

    var tieto = new XMLHttpRequest();
    tieto.open('GET', `https://financialmodelingprep.com/stable/profile?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

    tieto.onreadystatechange = function() {
        if (tieto.readyState === 4 && tieto.status === 200) {
            let data = JSON.parse(tieto.responseText);

            // Logon lisäys
            let kuva = document.createElement("img");
            kuva.src = data[0].image;
            kuva.width = 100;
            logo.innerHTML = "";
            logo.appendChild(kuva);

            // Yrityksen nimi
            nimi.textContent = data[0].companyName;

            // symbooli
            symbol.textContent = data[0].symbol;

            // Ala / sektori
            sector.textContent = data[0].sector

            // Pörssilistaus
            porssi.textContent = data[0].exchange

            // Tallennetaan valuutta
            valuutta = data[0].currency

            // nykyinen hinta
            hinta.textContent = data[0].price + " " + valuutta

            // Vaihdon määrä
            document.getElementById("vaihto").textContent = data[0].volume
            
            // Yrityksen kuvaus
            info.textContent = data[0].description
        }
    };
    tieto.send(); // Kutsu send() tämän ulkopuolella

    // Nollataan rajoitetut tiedot ettei tosen osakkeen tiedot jää näkyviin jos käyttäjä hakee toista osaketta joole ei ole saatavissa hinta tietoja
    document.getElementById("aloitushinta").textContent = "-"
    document.getElementById("ylin").textContent = "-"
    document.getElementById("alin").textContent = "-"

    // Jos ticker löytyy limited listasta haetaan tarkemmat hintatiedot
    if (limited.includes(syote)){
        var hintaTieto = new XMLHttpRequest();
        hintaTieto.open('GET', `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

        hintaTieto.onreadystatechange = function() {
            if (hintaTieto.readyState === 4 && hintaTieto.status === 200) {
                let hintadata = JSON.parse(hintaTieto.responseText);

                // Päivän avushinta
                document.getElementById("aloitushinta").textContent = `(Open ${hintadata[0].open} ${valuutta})`;
                // Päivän Ylin hinta
                document.getElementById("ylin").textContent = hintadata[0].high + " " + valuutta;
                // Päivän Alin hinta
                document.getElementById("alin").textContent = hintadata[0].low + " " + valuutta;

            }
        };
        hintaTieto.send();
    }
    
});