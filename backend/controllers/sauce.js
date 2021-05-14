const Sauce = require('../models/Sauce');
const sanitize = require ('mongo-sanitize');
const fs = require('fs');


exports.createSauce = (req,res,next) =>{ 
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    sauceObject.name = sanitize(sauceObject.name);
    sauceObject.manufacturer = sanitize(sauceObject.manufacturer);
    sauceObject.description = sanitize(sauceObject.description);
    sauceObject.mainPepper = sanitize(sauceObject.mainPepper);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes:0,
        dislikes:0,
        usersLiked:[],
        usersDisliked:[]
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregister'}))
    .catch(error => res.status(400).json({error}));
};


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?{
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {...req.body};
    Sauce.updateOne({_id: req.params.id},{...sauceObject, _id: req.params.id})
    .then(()=>res.status(200).json({message: 'Sauce modifiée'}))
    .catch(error => res.status(400).json({error}));
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {

        switch(req.body.like){
            
            case 1:
                sauce.usersLiked.push(req.body.userId);
                sauce.likes ++;
                break;
            case -1:
                sauce.usersDisliked.push(req.body.userId);
                sauce.dislikes ++;
                break;
            case 0:
                let indice = sauce.usersDisliked.findIndex(element => element === req.body.userId);
                indice !== -1?(
                    sauce.usersDisliked.splice(indice, 1),
                    sauce.dislikes --
                ) : (
                    indice = sauce.usersLiked.findIndex(element => element === req.body.userId),
                    sauce.likes --,
                    sauce.usersLiked.splice(indice, 1)
                );
                
                break;

        }

        sauce.save()
        .then(() => res.status(200).json({message: 'Compteur mis à jour'}))
        .catch(error => res.status(500).json({error}));
    })
    
    .catch(error => res.status(500).json({error}));
}

exports.deleteSauce = (req,res,next) =>{
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () =>{
            Sauce.deleteOne({_id: req.params.id})
            .then(()=>res.status(200).json({message: 'Sauce supprimée!'}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
};