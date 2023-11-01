const express = require('express');
const os = require('os');
const router = express.Router();

const fs = require('fs');
const path = require('path');

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './product-images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.mimetype.split("/")[1])
    }
})
const upload = multer({ storage: storage })

const passport = require('passport');

const requeteProduits = require("../queries/RequeteProduits");
const HttpError = require('../HttpError');

router.get('/categories', (req, res, next) => {
    requeteProduits.getCategories().then(categories => {
        res.json(categories)
    }).catch(err => {
        return next(err)
    })
})

router.get('/langues', (req, res, next) => {
    requeteProduits.getLangues().then(langues => {
        res.json(langues)
    }).catch(err => {
        return next(err)
    })
})

router.get('/genres', (req, res, next) => {
    requeteProduits.getGenres().then(genres => {
        res.json(genres)
    }).catch(err => {
        return next(err)
    })
})

router.get('/', (req, res, next) => {
    requeteProduits.getProduits().then(produits => {
        res.json(produits)
    }).catch(err => {
        return next(err)
    })
})

router.get('/aleatoires', (req, res, next) => {
    requeteProduits.getProduitsAleatoires().then(produits => {
        res.json(produits)
    }).catch(err => {
        return next(err)
    })
})

router.get('/categorie/:categorie', (req, res, next) => {
    const categorie = req.params.categorie
    requeteProduits.getProduitsParCategorie(categorie).then(produits => {
        res.json(produits)
    }).catch(err => {
        return next(err)
    })
})

router.get('/:id', (req, res, next) => {
    const id = req.params.id
    console.log('id: ', id)
    requeteProduits.getProduitParID(id).then(produit => {
        if (produit) {
            res.json(produit)
        } else {
            return next(new HttpError(404, `Produit ${id} introuvable`))
        }
    }).catch(err => {
        return next(err)
    })
})

router.post('/',
    passport.authenticate('basic', { session: false }),
    async (req, res, next) => {

        const user = req.user

        if (!user || user.role !== 'administrateur') {
            return next(new HttpError(403, "Droit administrateur requis"))
        }


        const produit = req.body
        await checkIntegriteProduit(produit)

        requeteProduits.getProduitParID(produit.id).then(produitDemande => {
            if (produitDemande)
                throw new HttpError(409, `Un produit avec l'id ${produit.id} existe déjà`)

            return requeteProduits.ajouterProduit(produit)
        }).then(resultat => {
            res.json(resultat)
        }).catch(err => {
            next(err)
        })
    })

router.put('/:id',
    passport.authenticate('basic', { session: false }),
    async (req, res, next) => {

        const user = req.user

        if (!user || user.role !== 'administrateur') {
            return next(new HttpError(403, "Droit administrateur requis"))
        }


        const produit = req.body
        await checkIntegriteProduit(produit, next)

        const id = req.params.id
        if (!id || id === '')
            return next(new HttpError(400, 'Le paramètre de route id est requis'))

        if (id !== produit.id)
            return next(new HttpError(400, `Le paramètre spécifie l'id ${id} alors que le produit fourni a l'id ${req.body.id}`))

        requeteProduits.modifierProduit(produit).then(resultat => {
            if (!resultat)
                return next(new HttpError(404, `Produit ${id} introuvable`));

            res.json(resultat)
        }).catch(err => {
            return next(err)
        })
    })


router.delete('/:id',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user

        if (!user || user.role !== 'administrateur') {
            return next(new HttpError(403, "Droit administrateur requis"))
        }

        const id = req.params.id
        if (!id || id === '') {
            return next(new HttpError(400, 'Le paramètre id est requis'))
        }

        requeteProduits.supprimerProduitParID(id).then(resultat => {
            if (!resultat) {
                return next(new HttpError(404, `Produit ${id} introuvable`))
            }

            res.json(resultat)
        }).catch(err => {
            return next(err)
        })
    })

router.get('/:id/image',
    (req, res, next) => {
        const id = req.params.id
        if (!id || id === '') {
            return next(new HttpError(400, 'Le paramètre id est requis'))
        }

        requeteProduits.getImagesUrl(id).then(resultat => {
            if (resultat) {
                Promise.all(resultat.map((imageDetails) => {
                    return new Promise((resolve, reject) => {
                        const ext = path.extname(imageDetails.url_image)
                        const normalizedPath = normalizePath(imageDetails.url_image)
                        fs.readFile(normalizedPath, (err, data) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve({ id: imageDetails.id, data: data, ext: ext })
                            }
                        })
                    })
                }))
                    .then(images => {
                        res.json(images.map(image => ({
                            id: image.id, data: `data:image/${image.ext};base64,${image.data.toString('base64')}`
                        })))
                    })
                    .catch(err => {
                        return next(err)
                    })
            } else {
                return next(new HttpError(404, `Produit ${id} introuvable`))
            }
        }).catch(err => {
            return next(err)
        })
    })

router.delete('/:id/image',
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
        const user = req.user

        if (!user || user.role !== 'administrateur') {
            return next(new HttpError(403, "Droit administrateur requis"))
        }

        const id = req.params.id
        if (!id || id === '') {
            return next(new HttpError(400, 'Le paramètre id est requis'))
        }

        requeteProduits.getImageUrlByImageId(id).then(resultat => {
            if (!resultat) {
                return next(new HttpError(404, `Image id ${id} introuvable`))
            }
            const url = resultat.url_image
            fs.unlink(url, (err => {
                if (err) return next(err)
                else {
                    requeteProduits.deleteImageUrlById(id).then(
                        res.json({ message: `image ${url} deleted` })
                    ).catch(err => {
                        return next(err)
                    })
                }
            }))
        }).catch(err => {
            return next(err)
        })
    })

router.put('/:id/image',
    passport.authenticate('basic', { session: false }),
    upload.single('image'),
    (req, res, next) => {
        const user = req.user

        if (!user || user.role !== 'administrateur') {
            return next(new HttpError(403, "Droit administrateur requis"))
        }

        const id = req.params.id
        if (!id || id === '') {
            return next(new HttpError(400, 'Le paramètre id est requis'))
        }

        if (!req.file) {
            return next(new HttpError(400, 'Le fichier image est requis'));
        }

        requeteProduits.ajouterImageProduit(id, req.file.path).then(resultat => {
            if (!resultat) {
                return next(new HttpError(404, `Produit ${id} introuvable`))
            }

            res.json({ message: 'Image ajouté avec succès' })
        }).catch(err => {
            return next(err)
        })
    })

module.exports = router;

function checkIntegriteProduit(produit, next) {
    if (!produit.id || !produit.nom || !produit.prix || !produit.quantite_disponible
        || !produit.description || produit.est_actif === undefined || !produit.categorie_nom) {
        return next(new HttpError(400, 'Des informations essentiels aux produits sont absent(s)'))
    }

    if (/\s/.test(produit.id)) {
        return next(new HttpError(400, 'L\'identifiant ne peut contenir d\'espace'))
    }

    if (produit.upc && !/^\d+$/.test(produit.upc)) {
        return next(new HttpError(400, 'L\'upc ne peut contenir que des chiffres'))
    }

    if (!/^[1-9]\d*(\.\d{1,2})?$/.test(produit.prix)) {
        return next(new HttpError(400, 'Le prix doit être un nombre avec un maximum de deux précisions.'))
    }

    if (!/^[1-9]\d*$/.test(produit.quantite_disponible)) {
        return next(new HttpError(400, 'La quantité doit être un nombre entier.'))
    }

    if (produit.isbn && !/^\d+$/.test(produit.isbn)) {
        return next(new HttpError(400, 'L\'isbn ne peut contenir que des chiffres'))
    }

    if (produit.nb_pages && !/^[1-9]\d*$/.test(produit.nb_pages)) {
        return next(new HttpError(400, 'Le nombre de pages doit être un nombre entier.'))
    }

    if (produit.nb_joueurs && !/^[1-9]\d*$/.test(produit.nb_joueurs)) {
        return next(new HttpError(400, 'Le nombre de joueurs doit être un nombre entier.'))
    }

    if (produit.temps_jeu_minutes && !/^[1-9]\d*$/.test(produit.temps_jeu_minutes)) {
        return next(new HttpError(400, 'Le temps de jeu en minutes doit être un nombre entier.'))
    }

    if (produit.age && !/^[1-9]\d*$/.test(produit.age)) {
        return next(new HttpError(400, 'L\'âge doit être un nombre entier.'))
    }

    if (produit.est_actif !== true && produit.est_actif !== false) {
        return next(new HttpError(400, 'Est actif doit être true ou false.'))
    }

    requeteProduits.getLangues().then(langues => {
        if (produit.langue_langue && !langues.includes(produit.langue_langue)) {
            return next(new HttpError(400, 'La langue ' + produit.langue_langue + ' n\'est pas dans la base de donnée.'))
        }
    }).catch(err => {
        return next(err)
    })

    requeteProduits.getGenres().then(genres => {
        if (produit.genres_jeux_livre_nom && !genres.includes(produit.genres_jeux_livre_nom)) {
            return next(new HttpError(400, 'La langue ' + produit.genres_jeux_livre_nom + ' n\'est pas dans la base de donnée.'))
        }
    }).catch(err => {
        return next(err)
    })

    requeteProduits.getCategories().then(categories => {
        if (!categories.includes(produit.categorie_nom)) {
            return next(new HttpError(400, 'La catégorie ' + produit.categorie_nom + ' n\'est pas dans la base de donnée.'))
        }
    }).catch(err => {
        return next(err)
    })
}


function normalizePath(filePath) {
    if (os.platform() === 'win32') {
        return filePath.replace(/\//g, '\\');
    } else {
        return filePath.replace(/\\/g, '/');
    }
}