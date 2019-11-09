const axios = require('axios');

const getMangaList = async () => {
    const response = await axios.get('https://www.mangaeden.com/api/list/1/');
    return response.data.manga;
}

const getMangaInfo = async (mangaId) => {
    const response = await axios.get(`https://www.mangaeden.com/api/manga/${mangaId}/`);
    return response.data;
}

module.exports = { getMangaList, getMangaInfo };