// ===============================================
// Publications page generator
// Reads assets/publications.bib and generates HTML
// ===============================================

document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("journal-publications"))
        return;

    loadPublications();

});


async function loadPublications() {

    try {

        const response = await fetch("assets/publications.bib");
        const bib = await response.text();

        const entries = parseBibTeX(bib);

        renderPublications(entries);

    }

    catch (err) {

        console.error(err);

        document.getElementById("journal-publications").innerHTML =
            "<p>Unable to load publications.</p>";

    }

}



// =====================================================
// Parse BibTeX
// =====================================================

function parseBibTeX(text) {

    const entries = [];

    const rawEntries = text.split("\n@");

    rawEntries.forEach(raw => {

        raw = raw.trim();

        if (!raw.length) return;

        if (!raw.startsWith("@"))
            raw = "@" + raw;

        const typeMatch = raw.match(/^@(\w+)/);

        if (!typeMatch) return;

        const type = typeMatch[1].toLowerCase();

        const fields = {};

        const fieldRegex =
            /(\w+)\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/g;

        let match;

        while ((match = fieldRegex.exec(raw)) !== null) {

            fields[match[1].toLowerCase()] =
                match[2].replace(/\n/g, " ").trim();

        }

        fields.type = type;

        entries.push(fields);

    });

    return entries;

}



// =====================================================
// Sort
// =====================================================

function sortEntries(entries) {

    return entries.sort((a, b) => {

        return Number(b.year) - Number(a.year);

    });

}
// =====================================================
// Render publications
// =====================================================

function renderPublications(entries) {

    entries = sortEntries(entries);

    const journals = entries.filter(e => e.type === "article");
    const conferences = entries.filter(e => e.type === "inproceedings");

    const journalContainer = document.getElementById("journal-publications");
    const confContainer = document.getElementById("conference-publications");

    journalContainer.innerHTML =
        "<h2 class='section-title'>Journal Articles</h2>" +
        buildSection(journals);

    if (conferences.length > 0) {

        confContainer.innerHTML =
            "<h2 class='section-title'>Conference Proceedings</h2>" +
            buildSection(conferences);

    }

}
function buildSection(entries) {

    let html = "";

    let currentYear = "";

    entries.forEach(entry => {

        if (entry.year !== currentYear) {

            currentYear = entry.year;

            html += `
                <h3 class="pub-year">${currentYear}</h3>
            `;

        }

        html += publicationCard(entry);

    });

    return html;

}
function publicationCard(entry) {

    const title = entry.title || "";

    const authors = formatAuthors(entry.author || "");

    const journal =
        entry.journal ||
        entry.booktitle ||
        "";

    const volume = entry.volume ?
        `<strong>${entry.volume}</strong>` : "";

    const pages = entry.pages || "";

    const year = entry.year || "";

    const doiButton = entry.doi ?

        `<a href="https://doi.org/${entry.doi}"
            target="_blank"
            class="pub-link">DOI</a>`

        :

        "";

    const bibtexButton =

        `<button class="pub-link bib-btn">
            BibTeX
        </button>`;

    return `

<div class="pub-card">

<h3>${title}</h3>

<p class="authors">
${authors}
</p>

<p class="journal">
<i>${journal}</i>
${volume}
${pages ? ", " + pages : ""}
(${year})
</p>

<div class="pub-links">

${doiButton}

${bibtexButton}

</div>

</div>

`;

}
function formatAuthors(authors) {

    return authors
        .replace(/ and /g, ", ")
        .replace(
            /Dipayan Chakraborty/g,
            "<strong>Dipayan Chakraborty</strong>"
        );

}
