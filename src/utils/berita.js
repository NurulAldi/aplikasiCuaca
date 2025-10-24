const request = require('postman-request')
const fs = require('fs')
const path = require('path')

const cacheFile = path.join(__dirname, '../../berita-cache.json')

const getBerita = (callback) => {
    // Cek apakah cache exists dan masih valid (< 24 jam)
    if (fs.existsSync(cacheFile)) {
        try {
            const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
            const now = new Date().getTime()
            const cacheTime = new Date(cacheData.timestamp).getTime()
            const oneDayInMs = 24 * 60 * 60 * 1000 // 24 jam dalam milliseconds
            
            // Jika cache masih valid (kurang dari 24 jam)
            if (now - cacheTime < oneDayInMs) {
                console.log('Menggunakan cache berita (masih valid)')
                return callback(undefined, cacheData.news)
            } else {
                console.log('Cache berita sudah expired, fetch data baru...')
            }
        } catch (error) {
            console.log('Error membaca cache, fetch data baru...')
        }
    }

    // Jika cache tidak ada atau sudah expired, fetch dari API
    const url = 'http://api.mediastack.com/v1/news?access_key=9a8750e0999050a004bbcf7a6c9dc6aa&languages=en&limit=12'

    request({ url: url, json: true }, (error, response) => {
        if(error) {
            callback('Tidak dapat terhubung ke layanan berita', undefined)
        } else if(response.body.error) {
            callback('Terjadi kesalahan pada API: ' + response.body.error.message, undefined)
        } else if(!response.body.data || response.body.data.length === 0) {
            callback('Tidak ada berita yang ditemukan', undefined)
        } else {
            // Simpan data ke cache
            const cacheData = {
                timestamp: new Date().toISOString(),
                news: response.body.data
            }
            
            try {
                fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
                console.log('Data berita berhasil disimpan ke cache')
            } catch (error) {
                console.log('Error menyimpan cache:', error.message)
            }
            
            callback(undefined, response.body.data)
        }
    })
}

module.exports = getBerita
