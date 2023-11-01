class ServiceError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function getResponseMessage(response) {
    try {
        const obj = await response.json();
        return obj.message ? obj.message : "Erreur inconnue";
    } catch (err) {
        return "" + err;
    }
}

async function createServiceError(response) {
    return new ServiceError(response.status, await getResponseMessage(response));
}


export async function fetchVillesParProvince(provinceCode) {
    const response = await fetch('/api/adresse/villes/' + provinceCode);

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}

export async function fetchProvinces() {
    const response = await fetch('/api/adresse/provinces');

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}