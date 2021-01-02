const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const port = process.env.PORT || 8080;
const app = express();
const images = [];

app.use('/', res => {
    res.json(images.toString());
});

app.use('/images', express.static(path.join(__dirname, '/images')))
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(res => {
    res.status(404).sendFile(__dirname, '/404.html');
});

indexImages();

console.log('Loaded ' + images.length + ' images.')
app.listen(port, () => console.log(`Listening on port ${port}.`));

function indexImages() {
    let files = fs.readdirSync("./images")
    files.forEach(value => images.push("./images" + '\\' + value))
}

module.exports = {
    indexImages: indexImages()
};
