const lukko = document.getElementById("lukittu");
// Näytetään aluksi pelkkä tiedonhaku palkki
lukko.style.display = "none";

// hintatietojen rajaus näihin osakkeisiin
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

///////////////////////////////////////////////////////////
// INFONAPIN LISÄYS
const infobtn = document.getElementById("infobtn");
const infotext = document.getElementById("infotext");
// Aluksi infoteksti pois näkyvistä
infotext.style.display = "none";

// Näytetään infoteksti nappia klikkaamalla ja muutetaan nuoli ikoni
infobtn.addEventListener("click", function(){
    const icon = infobtn.querySelector("i");

    // Näytetään teskti
    if (infotext.style.display === "none"){
        infotext.style.display = "block";
        icon.classList.remove("bi-caret-down-fill");
        icon.classList.add("bi-caret-up-fill");
        
    // Poistetaan teksti näkyvistä
    } else {
        infotext.style.display = "none";
        icon.classList.remove("bi-caret-up-fill");
        icon.classList.add("bi-caret-down-fill");
    }
});

///////////////////////////////////////////////////////////

const logo = document.getElementById("logo");
const lomake = document.getElementById("lomake");

// Lomakkeen lähettäminen
lomake.addEventListener('submit', function(e) {
    e.preventDefault(); // estää sivun latautumisen

    // otetaan hausta turhat välilyönnit pois ja muutetaan teksti isoiksi kirjaimiksi
    let syote = lomake.elements["kentta"].value.trim().toUpperCase();

    // tarkistetaan ettei hakukenttä ole tyhjä
    if (syote.length === 0) {
        document.getElementById("error").innerHTML = "No stocks found"
        return;
    }


    ///////////////////////////////////////////////////////////
    // 1 API KUTSU

    // luodaan uusi XMLHttpRequest-objekti
    var tieto = new XMLHttpRequest();
    // tehdään GET api-kutsu
    tieto.open('GET', `https://financialmodelingprep.com/stable/profile?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

    // kun tieto saapuu niin suoritetaan funktio
    tieto.onreadystatechange = function() {
        // jos ei tule virheitä -> jatketaan suorittamista
        if (tieto.readyState === 4 && tieto.status === 200) {
            // tallennetaan saapunut data muuttujaan
            let data = JSON.parse(tieto.responseText);

            // jos data on tyhjä -> pysäytetään suoritus ja annetaan käyttäjälle virhe teksti
            if (data.length === 0){
                lukko.style.display = "none";
                document.getElementById("error").innerHTML = "No stocks found"
                return;
            }
            // kun data ei ole tyhjä -> jatketaan suorittamista ja poistetaan mahdollinen virhe teksti
            document.getElementById("error").innerHTML = ""

            // Näytetään loppuosa sivusta
            lukko.style.display = "block";

            // Rullataan automaattisesti bodyn ekan divin alkuun
            document.getElementById("bodyAlku").scrollIntoView({ behavior: "smooth" });

            // Logon lisäys
            let kuva = document.createElement("img");
            kuva.src = data[0].image;
            kuva.width = 100;
            logo.innerHTML = "";
            logo.appendChild(kuva);

            // Yrityksen nimi
             document.getElementById("nimi").textContent = data[0].companyName;

            // symbooli
             document.getElementById("symbol").textContent = data[0].symbol;

            // Ala / sektori
             document.getElementById("sector").textContent = data[0].sector;

            // Pörssilistaus
             document.getElementById("porssi").textContent = data[0].exchange;

            // Tallennetaan valuutta globaaliin muuttujaan
            valuutta = data[0].currency;

            // tallennetaan nykyinen hinta globaaliin muuttujaan ja tulostetaan se
            nykhinta = parseFloat(data[0].price);
            document.getElementById("hinta").textContent = nykhinta + " " + valuutta;

            // Vaihdon määrä
            document.getElementById("vaihto").textContent = data[0].volume;
            
            // Yrityksen kuvaus
             document.getElementById("info").textContent = data[0].description;
        }
    };
    tieto.send(); // Kutsu

    ///////////////////////////////////////////////////////////
    // 2 API KUTSU

    // kerätään tiedot hinta charttia varten
    endhinnat = [];
    paivamaarat = [];
    endhinnat.length = 0;
    paivamaarat.length = 0;

    // Nollataan rajoitetut tiedot ettei toisen osakkeen tiedot jää näkyviin jos käyttäjä hakee toista osaketta jolle ei ole saatavissa hinta tietoja
    document.getElementById("aloitushinta").textContent = "-";
    document.getElementById("ylin").textContent = "-";
    document.getElementById("alin").textContent = "-";

    // Jos ticker löytyy limited listasta haetaan tarkemmat hintatiedot
    if (limited.includes(syote)){
        // luodaan uusi XMLHttpRequest-objekti
        var hintaTieto = new XMLHttpRequest();
        // tehdään GET api-kutsu
        hintaTieto.open('GET', `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

        // kun tieto saapuu niin suoritetaan funktio
        hintaTieto.onreadystatechange = function() {
            // jos ei tule virheitä -> jatketaan suorittamista
            if (hintaTieto.readyState === 4 && hintaTieto.status === 200) {
                // tallennetaan saapunut data muuttujaan
                let hintadata = JSON.parse(hintaTieto.responseText);


                ///////////////////////////////////////////////////////////
                //TIEDON KERUU
                // tallennetaan Päivän avushinta globaaliin muuttujaan ja tulostetaan se
                avshinta = parseFloat(hintadata[0].open);
                document.getElementById("aloitushinta").textContent = `(Open ${avshinta} ${valuutta})`;
                // Tallennetaan päivän Ylin hinta globaaliin muuttujaan ja tulostetaan se
                maxHinta = parseFloat(hintadata[0].high)
                document.getElementById("ylin").textContent = maxHinta + " " + valuutta;
                // Tallennetaan päivän Alin hinta globaaliin muuttujaan ja tulostetaan se
                minHinta = parseFloat(hintadata[0].low)
                document.getElementById("alin").textContent = minHinta + " " + valuutta;

            
                ///////////////////////////////////////////////////////////
                // laskut
                // Lasketaan tuottoprosentti ja muokataan tyyli -/+ prosenttilasku funktion avulla
                prosenttilaskut(avshinta, nykhinta, "pricemuutos")
                prosenttilaskut(avshinta, maxHinta, "maxmuutos")
                prosenttilaskut(avshinta, minHinta, "minmuutos")


                ///////////////////////////////////////////////////////////
                //CHART

                
                // lisätään vuoden jokainen päivä (ilman la ja su) ja niiden viimeisin hinta listoihin
                for (const element of hintadata) {
                    if (paivamaarat.length >= 260) {
                        break;
                    }
                    endhinnat.push(element.close);
                    paivamaarat.push(element.date);
                }

                // hinta chart
                var chartsLine = document.querySelectorAll(".chart-line");

                chartsLine.forEach(function(chart) {
                    // Jos chart on jo olemassa, tuhotaan se
                    if (chart.chart) {
                        chart.chart.destroy();
                    }

                    var ctx = chart.getContext("2d");

                    var gradient = ctx.createLinearGradient(0, 0, 0, 225);
                    gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
                    gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

                    // Luodaan uusi chart
                    taulukonLuonti(paivamaarat, endhinnat);
                    
                });


                ///////////////////////////////////////////////////////////
            };
        };
        hintaTieto.send(); // Kutsu
    };
});

///////////////////////////////////////////////////////////
    // chatin alasvetovalikon toiminnallisuus

const alasveto = document.getElementById("alasveto");

// kun chartin aikaväliä muutetaan
alasveto.addEventListener("change", function(){
    // muutetaan arvo numeroksi ja tallennetaan se muuttujaan
    const arvo = Number(alasveto.value);

    // otetaan tietty määrä päiviä mukaan charttiin arvon mukaan
    const pv = paivamaarat.slice(0, arvo);
    const hinnat = endhinnat.slice(0, arvo);

    // luodaan chart funktion avulla
    taulukonLuonti(pv, hinnat);
});





    ///////////////////////////////////////////////////////////
    // Prosenttien laskeminen ja tulostus

    function prosenttilaskut(hinta, hinnasta, id) {
        const element = document.getElementById(id);
        const icon = element.querySelector('i');

        // lasketaan muutos prosentteina
        let muutos = ((hinnasta - hinta) / hinta) * 100;

        // jos negatiivinen
        if (muutos < 0) {
            muutos *= -1;

            // muokataan tyyli
            element.classList.remove('bg-success');
            element.classList.add('bg-danger');
            icon.className = 'fas fa-arrow-down me-1';
        // jos positiivinen
        } else {
            // muokataan tyyli
            element.classList.remove('bg-danger');
            element.classList.add('bg-success');
            icon.className = 'fas fa-arrow-up me-1';
        }

        // asetetaan luku i-elementin perään
        element.innerHTML = `<i class="${icon.className}"></i> ${muutos.toFixed(2)}%`;
    };


    ///////////////////////////////////////////////////////////
    // Taulukon luonti funktio
    function taulukonLuonti(pv, hinta) {
        // Hinta chart
        var chartsLine = document.querySelectorAll(".chart-line");

        chartsLine.forEach(function(chart) {
            // Jos chart on jo olemassa, tuhotaan se
            if (chart.chart) {
                chart.chart.destroy();
            }

            var ctx = chart.getContext("2d");

            var gradient = ctx.createLinearGradient(0, 0, 0, 225);
            gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
            gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

            // Luodaan uusi chart
            chart.chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: pv, // lisätään päivämäärät datapisteille
                    datasets: [{
                        fill: false,   
                        backgroundColor: gradient,
                        borderColor: "#6366f1", // käyrän väri
                        data: hinta, // lisätään data datapisteille
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hitRadius: 10
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',  
                        axis: 'x',        
                        intersect: false
                    },
                    plugins: {
                        legend: { display: false },
                        filler: { propagate: false },
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `Hinta: ${context.raw} $`; // Näyttää hintatiedot hoverissa
                                }
                            }
                        }
                    },
                    scales: {
                        x: { reverse: true, grid: { display: false } },
                        y: { ticks: { stepSize: 10 }, border: { dash: [3, 3] }, grid: { display: false } }
                    }
                }
            });
        });
    }
