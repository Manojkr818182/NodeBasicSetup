const multer = require('multer');
const path = require('path');

const fileStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (request, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: fileStorage
});


module.exports = upload;
