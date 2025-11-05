const lukko = document.getElementById("lukittu");
// Näytetään aluksi pelkkä tiedonhaku palkki
//lukko.style.display = "none";

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

const lomake = document.getElementById("lomake");
lomake.addEventListener('submit', function(e) {
    e.preventDefault(); // estää sivun latautumisen

    let syote = lomake.elements["kentta"].value.trim().toUpperCase();

    if (syote.length === 0) {
        alert("Kenttä ei voi olla tyhjä!");
        return;
    }


    ///////////////////////////////////////////////////////////
    // 1 API KUTSU

    var tieto = new XMLHttpRequest();
    tieto.open('GET', `https://financialmodelingprep.com/stable/profile?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

    tieto.onreadystatechange = function() {
        if (tieto.readyState === 4 && tieto.status === 200) {
            let data = JSON.parse(tieto.responseText);

            if (data.length === 0){
                lukko.style.display = "none";
                alert("No stocks found");
                document.getElementById("error").innerHTML = "No stocks found"
                return;
            }
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

            // Tallennetaan valuutta
            valuutta = data[0].currency;

            // tallennetaan nykyinen hinta
            nykhinta = parseFloat(data[0].price);
            document.getElementById("hinta").textContent = nykhinta + " " + valuutta;

            // Vaihdon määrä
            document.getElementById("vaihto").textContent = data[0].volume;
            
            // Yrityksen kuvaus
             document.getElementById("info").textContent = data[0].description;
        }
    };
    tieto.send(); // Kutsu send() tämän ulkopuolella

    ///////////////////////////////////////////////////////////
    // 2 API KUTSU

    // kerätään tiedot hinta charttia varten
    endhinnat = [];
    paivamaarat = [];
    endhinnat.length = 0;
    paivamaarat.length = 0;

    // Nollataan rajoitetut tiedot ettei tosen osakkeen tiedot jää näkyviin jos käyttäjä hakee toista osaketta joole ei ole saatavissa hinta tietoja
    document.getElementById("aloitushinta").textContent = "-";
    document.getElementById("ylin").textContent = "-";
    document.getElementById("alin").textContent = "-";

    // Jos ticker löytyy limited listasta haetaan tarkemmat hintatiedot
    if (limited.includes(syote)){
        var hintaTieto = new XMLHttpRequest();
        hintaTieto.open('GET', `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

        hintaTieto.onreadystatechange = function() {
            if (hintaTieto.readyState === 4 && hintaTieto.status === 200) {
                let hintadata = JSON.parse(hintaTieto.responseText);


                ///////////////////////////////////////////////////////////
                //TIEDON KERUU
                // tallennetaan Päivän avushinta
                avshinta = parseFloat(hintadata[0].open);
                document.getElementById("aloitushinta").textContent = `(Open ${avshinta} ${valuutta})`;
                // Päivän Ylin hinta
                maxHinta = parseFloat(hintadata[0].high)
                document.getElementById("ylin").textContent = maxHinta + " " + valuutta;
                // Päivän Alin hinta
                minHinta = parseFloat(hintadata[0].low)
                document.getElementById("alin").textContent = minHinta + " " + valuutta;

            
                ///////////////////////////////////////////////////////////
                // laskut
                // Lasketaan tuottoprosentti ja muokataan tyyli -/+
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
        hintaTieto.send();
    };
});

///////////////////////////////////////////////////////////
    // Alasvetovalikon toiminnallisuus

const alasveto = document.getElementById("alasveto");

alasveto.addEventListener("change", function(){
    const arvo = Number(alasveto.value);

    const pv = paivamaarat.slice(0, arvo);
    const hinnat = endhinnat.slice(0, arvo);

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
                    labels: pv,
                    datasets: [{
                        label: "End ($)",
                        fill: false,           // HUOM: jos fill = true, viiva saattaa piiloutua gradientin alle
                        backgroundColor: gradient,
                        borderColor: "#007bff",
                        data: hinta,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hitRadius: 10
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',    // Hover seuraa x-akselin mukaista datapistettä
                        axis: 'x',        // Pystysuora viiva
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
