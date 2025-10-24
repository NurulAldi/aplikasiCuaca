const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const forecast = require('./utils/prediksiCuaca')
const getBerita = require('./utils/berita')

// mendefiniskan jalur untuk konfigurasi express
const direktoriPublic = path.join(__dirname, '../public')
const direktoriViews = path.join(__dirname, '../templates/views')
const direktoriPartials = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', direktoriViews)
hbs.registerPartials(direktoriPartials)

hbs.registerHelper('formatDate', function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

// setup direktori statis
app.use(express.static(direktoriPublic))



// ini halaman utama
app.get('', (req, res) => {
    res.render('index', {
        judul: 'Aplikasi Cek Cuaca',
        nama: 'Nurul Aldi'
    })
})

// ini halaman bantuan/FAQ
app.get('/bantuan', (req, res) => {
    res.render('bantuan', {
        judul: 'Halaman Bantuan',
        nama: 'Nurul Aldi',
        teksBantuan: 'ini adalah teks bantuan'
    })
})

// ini halaman info cuaca
app.get('/infocuaca', (req, res) => {
    if(!req.query.address) {
        return res.send({
            error: 'Kamu harus memasukkan lokasi yang ingin dicari'
        })
    }

    geocode(req.query.address, (error, { latitude, longitude, location } = {}) => {
        if(error) {
            return res.send({error})
        }
        forecast(latitude, longitude, (error, dataPrediksi) => {
            if(error) {
                return res.send({error})
            }
            res.send({
                prediksiCuaca: dataPrediksi,
                lokasi: location,
                address: req.query.address
            })
        })
    } )
})

// ini halaman tentang
app.get('/tentang', (req, res) => {
    res.render('tentang', {
        judul: 'Tentang saya',
        nama: 'Nurul Aldi'
    })
})

// ini halaman berita
app.get('/berita', (req, res) => {
    getBerita((error, dataBerita) => {
        if(error) {
            return res.render('berita', {
                judul: 'Berita Terkini',
                nama: 'Nurul Aldi',
                error: error
            })
        }
        res.render('berita', {
            judul: 'Berita Terkini',
            nama: 'Nurul Aldi',
            news: dataBerita
        })
    })
})

app.get('/bantuan/*', (req, res) => {
    res.render('404', {
        judul: '404',
        nama: 'Nurul Aldi',
        pesanKesalahan: 'Artikel yang dicari tidak ditemukan.'
    })
})

app.get('*', (req, res) => {
    res.render('404', {
        judul: '404',
        nama: 'Nurul Aldi',
        pesanKesalahan: 'Halaman tidak ditemukan.'
    })
})

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server berjalan pada port ${process.env.PORT || 4000}`)
})