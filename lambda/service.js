const axios = require('axios');
const querystring = require('querystring');
const key = ''; // private key

const getMangaList = async () => {
    const response = await axios.get('https://www.mangaeden.com/api/list/1/');
    return response.data.manga;
}

const getMangaInfo = async (mangaId) => {
    const response = await axios.get(`https://www.mangaeden.com/api/manga/${mangaId}/`);
    return response.data;
}

const getLanguage = async (text) => {
    const response = await axios.post(`https://translate.yandex.net/api/v1.5/tr.json/detect`,
        querystring.stringify({ text, key }));
    return response.data.lang;
}

const getItalianTranslation = async (text) => {
    const response = await axios.post(`https://translate.yandex.net/api/v1.5/tr.json/translate`,
        querystring.stringify({ text, key, lang: 'it', format: 'html' }));
    return response.data.text[0];
}

const getTranslatedGenre = (genre) => {
    switch (genre) {
        case 'School Life':
        case 'Scolastico':
            return 'Scolastico';
        case 'Shoujo':
            return 'Shojo';
        case 'Comedy':
        case 'Commedia':
            return 'Commedia';
        case 'Drama':
        case 'Tragedy':
            return 'Drammatico';
        case 'Romance':
        case 'Romantico':
            return 'Romantico';
        case 'Shounen':
            return 'Shonen';
        case 'Vita Quotidiana':
        case 'Slice of Life':
            return 'Vita Quotidiana';
        case 'Mystery':
        case 'Misteri':
            return 'Mistero';
        case 'Sci-fi':
        case 'Sci-Fi':
            return 'Fantascienza';
        case 'Supernatural':
        case 'Sovrannaturale':
            return 'Sovrannaturale';
        case 'Psychological':
        case 'Psicologico':
            return 'Psicologico';
        case 'Action':
        case 'Azione':
            return 'Azione';
        case 'Fantasy':
            return 'Fantasy';
        case 'Sports':
        case 'Sportivo':
            return 'Sportivo';
        case 'Martial Arts':
            return 'Arti Marziali';
        case 'Adult':
        case 'Mature':
            return 'Maturo';
        case 'Seinen':
            return 'Seinen';
        case 'Historical':
        case 'Storico':
            return 'Storico';
        case 'Adventure':
        case 'Avventura':
            return 'Avventura';
        case 'Ecchi':
        case 'Hentai':
            return 'Erotico';
        case 'Josei':
            return 'Josei';
        case 'Horror':
            return 'Orrore';
        case 'Magico':
            return 'Magia';
        case 'Sentimentale':
            return 'Sentimentale';
        case 'Harem':
            return 'Harem';
        case 'Gender Bender':
            return 'Inversione di Genere';
        case 'Smut':
            return 'Smut';
        case 'Yaoi':
            return 'Yaoi';
        case 'Musica':
            return 'Musica';
        case 'Yuri':
            return 'Yuri';
        case 'Mecha':
            return 'Robottoni';
        case 'Raccolta':
            return 'Raccolta di Storie';
        case 'Splatter':
            return 'Splatter';
        case 'Demenziale':
            return 'Demenziale';
        case 'Doujinshi':
        case 'Dounshinji':
            return 'Fanzina';
        case 'Bara':
            return 'Bara';
        case 'Shota':
            return 'Ragazzo Giovane';
        default:
            return genre;
    }
}

module.exports = { getMangaList, getMangaInfo, getLanguage, getItalianTranslation, getTranslatedGenre };