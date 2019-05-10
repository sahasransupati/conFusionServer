const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Favourites = require('../models/favourites');

const cors = require('./cors');

const favouritesRouter = express.Router();

var authenticate = require('../authenticate');

favouritesRouter.use(bodyParser.json());

favouritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favourite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
   
    Favourites.findOne({user:req.user._id})
    .then((favourite) => {
        if (favourite) {
            for (var i=0; i<req.body.length; i++) {
                if (favourite.dishes.indexOf(req.body[i]._id) === -1) {
                    console.log("add");
                    favourite.dishes.push(req.body[i]._id);
                }
            }
            favourite.save()
            .then((favourite) => {
                console.log('Favourites Created ', favourite);
                res.statusCode = 200;
                console.log("code" , res.statusCode)
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);
            }, (err) => next(err)); 
        }
        else {
            console.log("create");
            Favourites.create({"user": req.user._id, "dishes": req.body})
            .then((favourite) => {
                console.log('Favourite Created ', favourite);
                res.statusCode = 200;
                console.log("code", res.statusCode)
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));  
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));   
});

favouritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favourites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourite) => {
        if (favourite) {            
            if (favourite.dishes.indexOf(req.params.dishId) === -1) {
                favourite.dishes.push(req.params.dishId)
                favourite.save()
                .then((favourite) => {
                    console.log('Favourite Created ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err))
            }
        }
        else {
            Favourites.create({"user": req.user._id, "dishes": [req.params.dishId]})
            .then((favourite) => {
                console.log('Favourite Created ', favourite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourite) => {
        if (favourite) {            
            index = favourite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favourite.dishes.splice(index, 1);
                favourite.save()
                .then((favourite) => {
                    console.log('Favourite Deleted ', favourite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favourites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouritesRouter;