class DeltagerManager {
    #deltagere = [];
    #registrering;
    #resultat;
    #status;

    constructor(root) {
        this.#registrering = root.querySelector(".registrering");
        this.#resultat = root.querySelector(".resultat");
        this.#status = this.#registrering.querySelector("p");

        const regBtn = this.#registrering.querySelector("button");
        regBtn.addEventListener("click", () => this.#registrer());

        const visBtn = this.#resultat.querySelector("button");
        visBtn.addEventListener("click", () => this.#vis());
    }

    #parseTid(input) {
        if (!input) return null;
        const parts = input.split(":").map(p => parseInt(p, 10));
        if (parts.length === 3) {
            return parts[0]*3600 + parts[1]*60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0]*60 + parts[1];
        }
        return NaN;
    }

    #formatTid(sec) {
        const h = Math.floor(sec/3600);
        const m = Math.floor((sec%3600)/60);
        const s = sec%60;
        return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
    }

    #registrer() {
        const startnrEl = this.#registrering.querySelector("#startnummer");
        const navnEl = this.#registrering.querySelector("#deltagernavn");
        const tidEl = this.#registrering.querySelector("#sluttid");

        const startnr = parseInt(startnrEl.value.trim(),10);
        const navn = navnEl.value.trim();
        const tid = this.#parseTid(tidEl.value);

        if (!startnr || !navn || !tid) return; // hvis noen felt mangler, gjør ingenting

        if (this.#deltagere.some(d => d.startnr === startnr)) {
            startnrEl.setCustomValidity("Startnummeret er allerede i bruk");
            startnrEl.reportValidity();
            return;
        }

        this.#deltagere.push({startnr, navn: this.#prettifyNavn(navn), tid});
        this.#deltagere.sort((a,b) => a.tid - b.tid);

        this.#status.classList.remove("hidden");
        const spans = this.#status.querySelectorAll("span");
        spans[0].textContent = navn;
        spans[1].textContent = startnr;
        spans[2].textContent = this.#formatTid(tid);

        startnrEl.value = "";
        navnEl.value = "";
        tidEl.value = "";
        startnrEl.focus();
    }

    #prettifyNavn(raw) {
        return raw.split(/\s+/).map(part => part.split('-').map(seg => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase()).join('-')).join(' ');
    }

    #vis() {
        const fraEl = this.#resultat.querySelector("#nedregrense");
        const tilEl = this.#resultat.querySelector("#ovregrense");
        const tbody = this.#resultat.querySelector("tbody");
        const ingen = this.#resultat.querySelector("p");

        let fra = fraEl.value ? this.#parseTid(fraEl.value) : null;
        let til = tilEl.value ? this.#parseTid(tilEl.value) : null;

        if (fra !== null && til !== null && fra > til) {
            tilEl.setCustomValidity("Til må være større eller lik Fra");
            tilEl.reportValidity();
            return;
        }

        tilEl.setCustomValidity("");

        let liste = this.#deltagere;
        if (fra!==null) liste = liste.filter(d => d.tid >= fra);
        if (til!==null) liste = liste.filter(d => d.tid <= til);

        tbody.innerHTML = "";
        if (liste.length === 0) {
            ingen.style.display = "block";
            return;
        }
        ingen.style.display = "none";

        liste.forEach(d => {
            const plass = this.#deltagere.indexOf(d) + 1;
            const row = document.createElement("tr");
            row.innerHTML = `<td>${plass}</td><td>${d.startnr}</td><td>${d.navn}</td><td>${this.#formatTid(d.tid)}</td>`;
            tbody.appendChild(row);
        });
    }
} 

const rootelement = document.getElementById("root");
new DeltagerManager(rootelement);
