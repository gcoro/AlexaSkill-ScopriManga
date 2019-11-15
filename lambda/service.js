const axios = require('axios');
const key = '';// personal API key

const getMangaList = async () => {
    const response = await axios.get('https://www.mangaeden.com/api/list/1/');
    return response.data.manga;
}

const getMangaInfo = async (mangaId) => {
    const response = await axios.get(`https://www.mangaeden.com/api/manga/${mangaId}/`);
    return response.data;
}

const getLanguage = async (text) => {
    const response = await axios.get(`https://translate.yandex.net/api/v1.5/tr.json/detect?key=${key}&text=${text}`);
    return response.data.lang;
}

const getItalianTranslation = async(text) => {
    const response = await axios.get(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${key}&text=${text}&lang=it`);
    return response.data.text[0];
}

module.exports = { getMangaList, getMangaInfo, getLanguage, getItalianTranslation };