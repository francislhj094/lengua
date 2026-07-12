const fs = require('fs');
// Actually, since it's just a file extension mismatch we can use sharp or canvas, but we don't have them installed globally.
// If it's a JPG, it doesn't matter much for the web, but iOS requires PNG.
// Let's just install jimp locally and convert it.
