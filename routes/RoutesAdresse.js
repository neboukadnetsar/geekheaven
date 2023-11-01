const express = require('express');
const router = express.Router();
const HttpError = require("../HttpError");

const requetesAdresse = require('../queries/RequetesAdresse');

router.get('/villes/:province', (req, res, next) => {
    const province = req.params.province;
    requetesAdresse.getVillesParProvince(province).then(villes => {
        if(villes) {
            res.json(villes);
        }else{
            return next(new HttpError(404, `Aucune données pour ${province} disponibles`));
        }
        
    }).catch(err => {
        return next(err)
    })
});

router.get('/provinces', (req, res, next) => {

    requetesAdresse.getProvinces().then(provinces => {
        res.json(provinces);
    }).catch(err => {
        return next(err)
    })
});

module.exports = router;