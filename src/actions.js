export const actionTypes = {
    SORT: 'SORT',
    MOVE_DOCUMENT: 'MOVE_DOCUMENT'
};

export function sortDocuments(columnKey, sortDir) {
    return {
        type: 'SORT',
        columnKey,
        sortDir
    };
}

export function moveDocument(documentToCopy, folderToCopyIn) {
    return {
        type: 'MOVE_DOCUMENT',
        documentToCopy,
        folderToCopyIn
    }
}
