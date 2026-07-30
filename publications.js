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
