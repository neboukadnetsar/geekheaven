export function cleanPhoneNumber (phoneNumber) {
    return phoneNumber.replace(/[\s-()]/g, '');
}

