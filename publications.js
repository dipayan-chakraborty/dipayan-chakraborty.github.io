// ======================================================
// publications.js
// Automatically generates the Publications page
// from assets/publications.bib
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("journal-publications"))
        return;

    loadPublications();

});


// ======================================================
// Load BibTeX
// ======================================================

async function loadPublications() {

    try {

        const response = await fetch("assets/publications.bib");

        if (!response.ok)
            throw new Error("Cannot load assets/publications.bib");

        const bibText = await response.text();

        const entries = parseBibTeX(bibText);

        renderPublications(entries);

    }

    catch (err) {

        console.error(err);

        document.getElementById("journal-publications").innerHTML =
            "<p>Unable to load publications.</p>";

    }

}


// ======================================================
// Parse BibTeX
// ======================================================

function parseBibTeX(text) {

    const entries = [];

    // split before every @article, @inproceedings, etc.
    const rawEntries = text.split(/\n(?=@)/);

    rawEntries.forEach(raw => {

        raw = raw.trim();

        if (!raw.startsWith("@"))
            return;

        const typeMatch = raw.match(/^@(\w+)/);

        if (!typeMatch)
            return;

        const type = typeMatch[1].toLowerCase();

        const fields = {};

        fields.type = type;

        fields.raw = raw;

        // remove first line (@article{...)
        const body = raw.substring(raw.indexOf(",") + 1);

        // read field=value pairs
        const regex = /(\w+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|\".*?\")\s*,?/gs;

        let match;

        while ((match = regex.exec(body)) !== null) {

            let value = match[2];

            value = value.trim();

            if (value.startsWith("{"))
                value = value.slice(1, -1);

            if (value.startsWith('"'))
                value = value.slice(1, -1);

            fields[match[1].toLowerCase()] = value.trim();

        }

        entries.push(fields);

    });

    return entries;

}


// ======================================================
// Sort newest first
// ======================================================

function sortEntries(entries) {

    return entries.sort((a, b) => {

        return Number(b.year) - Number(a.year);

    });

}


// ======================================================
// Escape HTML
// ======================================================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// ======================================================
// Format author list
// ======================================================

function formatAuthors(authors, corresponding = "") {

    const correspondingAuthors = corresponding
        .split(/\s+and\s+/)
        .map(a => a.trim());

    const list = authors.split(/\s+and\s+/);

    const formatted = list.map(author => {

        author = author.trim();

        // Convert "Last, First" -> "First Last"
        if (author.includes(",")) {

            const parts = author.split(",");

            author = parts[1].trim() + " " + parts[0].trim();

        }

        const isCorresponding = correspondingAuthors.includes(author);

        if (author === "Dipayan Chakraborty") {

            author = "<strong>Dipayan Chakraborty</strong>";

            if (isCorresponding) {

    author += '<span class="corr-author" title="Corresponding Author">&#9993;</span>';

             }

        }

        return author;

    });

    return formatted.join(", ");

}
// ======================================================
// Build publication card
// ======================================================

function publicationCard(entry) {

    const title = (entry.title || "")
        .replace(/[{}]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const authors = formatAuthors(
    entry.author || "",
    entry.corresponding || ""
);

    const journal = (entry.journal || entry.booktitle || "")
        .replace(/[{}]/g, "")
        .trim();

    const volume = entry.volume || "";
    const number = entry.number || "";
    const pages = entry.pages || "";
    const year = entry.year || "";

    let journalLine = `<i>${journal}</i>`;

    if (volume)
        journalLine += ` <strong>${volume}</strong>`;

    if (number)
        journalLine += `(${number})`;

    if (pages)
        journalLine += `, ${pages}`;

    if (year)
        journalLine += ` (${year})`;

    const doiButton = entry.doi
        ? `<a class="pub-link"
              href="https://doi.org/${entry.doi}"
              target="_blank"
              rel="noopener">
              DOI
           </a>`
        : "";

    const bibButton =
        `<button type="button"
                 class="pub-link bib-btn">
            BibTeX
        </button>`;

    return `

<div class="pub-card">

    <h3>${title}</h3>

    <p class="authors">
        ${authors}
    </p>

    <p class="journal">
        ${journalLine}
    </p>

    <div class="pub-links">
        ${doiButton}
        ${bibButton}
    </div>

    <pre class="bibtex" style="display:none;">${escapeHTML(entry.raw)}</pre>

</div>

`;

}



// ======================================================
// Build section grouped by year
// ======================================================

function buildSection(entries) {

    let html = "";

    let currentYear = "";

    entries.forEach(entry => {

        if (entry.year !== currentYear) {

            currentYear = entry.year;

            html += `<h3 class="pub-year">${currentYear}</h3>`;

        }

        html += publicationCard(entry);

    });

    return html;

}



// ======================================================
// Render page
// ======================================================

function renderPublications(entries) {

    entries = sortEntries(entries);

    const journals =
        entries.filter(e => e.type === "article");

    const conferences =
        entries.filter(e => e.type === "inproceedings");

    const journalContainer =
        document.getElementById("journal-publications");

    const confContainer =
        document.getElementById("conference-publications");

    journalContainer.innerHTML =
        `<h2 class="section-title">Journal Articles</h2>` +
        buildSection(journals);

    if (conferences.length) {

        confContainer.innerHTML =
            `<h2 class="section-title">Conference Proceedings</h2>` +
            buildSection(conferences);

    }

}



// ======================================================
// BibTeX show / hide
// ======================================================

document.addEventListener("click", function(event) {

    if (!event.target.classList.contains("bib-btn"))
        return;

    const card = event.target.closest(".pub-card");

    const bib = card.querySelector(".bibtex");

    if (bib.style.display === "none") {

        bib.style.display = "block";

        event.target.textContent = "Hide BibTeX";

    }
    else {

        bib.style.display = "none";

        event.target.textContent = "BibTeX";

    }

});