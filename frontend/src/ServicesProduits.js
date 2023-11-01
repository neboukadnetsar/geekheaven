class ServiceError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
    }
}

import session from './session.js'

async function getResponseMessage(response) {
    try {
        const obj = await response.json()
        return obj.message ? obj.message : "Erreur inconnue"
    } catch (err) {
        return "" + err
    }
}

async function createServiceError(response) {
    return new ServiceError(response.status, await getResponseMessage(response))
}

export async function fetchCategories() {
    const response = await fetch('/api/produits/categories')

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}

export async function fetchLangues() {
    const response = await fetch('/api/produits/langues')

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}

export async function fetchGenres() {
    const response = await fetch('/api/produits/genres')

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}

export async function fetchProduit(id) {
    const response = await fetch('/api/produits/' + id)

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}

export async function fetchProduits() {
    const response = await fetch('/api/produits');

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw new Error("Impossible de récupérer la liste des produits");
    }
}

export async function fetchProduitsAleatoires() {
    const response = await fetch('/api/produits/aleatoires');

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw new Error("Impossible de récupérer la liste des produits");
    }
}

export async function fetchProduitsParCategorie(categorie) {
    const response = await fetch('/api/produits/categorie/' + categorie);
    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw new Error("Impossible de récupérer la liste des produits");
    }
}

export async function postProduit(produit) {
    const response = await fetch('/api/produits', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders()
        },
        body: JSON.stringify(produit)
    })

    if (response.ok) {
        return await response.json()
    } else {
        throw await createServiceError(response)
    }
}

export async function putProduit(produit) {
    const response = await fetch('/api/produits/' + produit.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders()
        },
        body: JSON.stringify(produit)
    })

    if (response.ok) {
        return await response.json()
    } else {
        throw await createServiceError(response)
    }
}

export async function fetchImages(produitID) {
    const response = await fetch('/api/produits/' + produitID + '/image')

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}

export async function putImage(produitID, image) {
    const formData = new FormData()
    formData.append('image', image)

    const response = await fetch('/api/produits/' + produitID + '/image', {
        method: "PUT",
        headers: {
            ...session.getAuthHeaders()
        },
        body: formData
    })

    if (response.ok) {
        return await response.json()
    } else {
        throw await createServiceError(response)
    }
}

export async function deleteImage(imageID) {
    const response = await fetch(`/api/produits/${imageID}/image`, {
        method: "DELETE",
        headers: {
            ...session.getAuthHeaders()
        }
    })

    if (response.ok) {
        const responseJson = await response.json()
        return responseJson
    } else {
        throw await createServiceError(response)
    }
}