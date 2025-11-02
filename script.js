const lukko = document.getElementById("lukittu");
// Näytetään aluksi pelkkä tiedonhaku palkki
lukko.style.display = "none";

const logo = document.getElementById("logo");
const nimi = document.getElementById("nimi");
const symbol = document.getElementById("symbol");
const sector = document.getElementById("sector");
const porssi = document.getElementById("porssi");

const lomake = document.getElementById("lomake");
lomake.addEventListener('submit', function(e) {
    e.preventDefault(); // estää sivun latautumisen

    let syote = lomake.elements["kentta"].value.trim();

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
            logo.appendChild(kuva);

            // Yrityksen nimi
            nimi.textContent = data[0].companyName;

            // symbooli
            symbol.textContent = data[0].symbol;

            // Ala / sektori
            sector.textContent = data[0].sector

            // Pörssilistaus
            porssi.textContent = data[0].exchange

        }
    };

    tieto.send(); // Kutsu send() tämän ulkopuolella
});