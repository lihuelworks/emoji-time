export function generateShareString(dataArray) {
    const names = dataArray.map(obj => obj.name);

    const encodedNames = btoa(JSON.stringify(names));

    const baseUrl = window.location.origin;

    const shareString = `${baseUrl}/?timezones=${encodedNames}`;

    return shareString;
}

export function decodeShareString(shareString) {
    const decodedNames = atob(shareString);

    const namesArray = JSON.parse(decodedNames);

    return namesArray;
}