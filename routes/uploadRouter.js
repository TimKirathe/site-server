const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, callbackFn) => {
        callbackFn(null, 'public/images');
    },
    filename: (req, file, callbackFn) => {
        callbackFn(null, file.originalname);
    }
});

const imageFileFilter = (req, file, callbackFn) => {
    if(!file.originalname.match(/\.(jpg|png|jpeg|gif)$/)) {
        return callbackFn(new Error('You can only submit image files.'), false);
    }
    return callbackFn(null, true);
}

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET method is not supported for /imageUpload route.');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT method is not supported for /imageUpload route.');    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;    
    res.end('DELETE method is not supported for /imageUpload route.');    
})

module.exports = uploadRouter;