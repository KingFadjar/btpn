const redis = require('redis');
const client = redis.createClient();
const UserInfo = require('../models/userInfoModel');

// Middleware untuk caching data UserInfo
exports.cacheUserInfo = (req, res, next) => {
    const userId = req.params.userId;
    client.get(userId, (err, data) => {
        if (err) {
            console.error(err);
            next(); // Lanjut ke handler berikutnya jika terjadi kesalahan Redis
        }
        if (data !== null) {
            // Mengembalikan data dari cache jika tersedia
            res.send(JSON.parse(data));
        } else {
            // Jika tidak ada data di cache, lanjutkan ke handler untuk mendapatkan data dari database
            next();
        }
    });
};

// Handler untuk mendapatkan data UserInfo dari database
exports.getUserInfo = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userInfo = await UserInfo.findById(userId);
        // Simpan data UserInfo di cache untuk penggunaan berikutnya
        client.setex(userId, 3600, JSON.stringify(userInfo)); // Set expire time 1 jam (3600 detik)
        res.send(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
