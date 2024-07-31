const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const fs = require('fs');

exports.generateToken = (user_id) => {
    return new Promise((resolve, reject) => {
        const payload = {
            user_id: user_id,
        };
        const secret = process.env.JWT_KEY;
        const options = {
            issuer: 'MNJ'
        };
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        })
    });
};

exports.remove_file = async (filePath) => {
    try {
       await fs.unlinkSync(filePath);
    } catch (err) {
        console.error("Failled to remove file:", err.toString());
    }
};

exports.optimizeImage = (input_file_path, output_file_path) => {
    return new Promise((resolve, reject) => {
        sharp(input_file_path)
            .resize({ width: 1024 })
            .toFile(output_file_path)
            .then(() => {
                resolve('Image resized successfully');
                this.remove_file(input_file_path);
            }).catch(error => {
                console.error('Error resizing image:', error);
                reject('Error resizing image');
            });
    });
};

exports.generateThumbnail = (input_file_path, output_file_path) => {
    return new Promise((resolve, reject) => {
        sharp(input_file_path)
            .resize({ width: 250 })
            .toFile(output_file_path)
            .then(() => {
                resolve('Image resized successfully');
            })
            .catch(error => {
                console.error('Error resizing image:', error);
                reject('Error resizing image');
            });
    });
};
