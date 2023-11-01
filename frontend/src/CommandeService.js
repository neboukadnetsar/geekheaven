import session from './session';

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

export async function soumettreCommande(usePoints = false) {
    const response = await fetch('/api/commande',{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders(),
        },
        body: JSON.stringify({usePoints})
    });

    if(response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}

export async function getAllOrders() {
    const response = await fetch(`/api/commande`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...session.getAuthHeaders()
            },
        });

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}

export async function getOrdersByUser(courriel) {
    const response = await fetch(`/api/commande/${courriel}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...session.getAuthHeaders()
            },
        });

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}

export async function deleteOrder(orderId) {
    const response = await fetch(`/api/commande/delete/${orderId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...session.getAuthHeaders()
            }
        });

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}

export async function expediateOrder(orderId) {
    const response = await fetch(`/api/commande/expediate/${orderId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...session.getAuthHeaders()
            }
        });

    if (response.ok) {
        const respJson = await response.json();
        return respJson;
    } else {
        throw await createServiceError(response);
    }
}