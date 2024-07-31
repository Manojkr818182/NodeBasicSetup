const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/MNJ').then(() => {
    console.log('Connected to Database.');
}).catch((error) => {
    console.error('Error connecting to MongoDB', error);
});   