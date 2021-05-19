const validator = require('validator');

module.exports = (req,res,next) =>{
    try{
        if(!validator.isEmail(req.body.email)){
            throw 'Rentrer une adresse mail valide : example@email.com';
        }
        if(!validator.isStrongPassword(req.body.password)){
            throw 'Votre mot de passe doit: Avoir au minimum une longueur de 8 caractères, une majuscule, minuscule, chiffre,symbole.'
        }
        else{
            next();
        }
    }catch(err){
        res.status(401).json({
            error: err
        })
    }

}