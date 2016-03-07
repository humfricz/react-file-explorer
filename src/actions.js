export const actionTypes = {
    SORT: 'SORT',
    MOVE_DOCUMENT: 'MOVE_DOCUMENT',
    FOLDER_FOLD_TOGGLE: 'FOLDER_FOLD_TOGGLE'
};

export function sortDocuments(columnKey, sortDir) {
    return {
        type: actionTypes.SORT,
        columnKey,
        sortDir
    };
}

export function moveDocument(documentToCopy, folderToCopyIn) {
    return {
        type: actionTypes.MOVE_DOCUMENT,
        documentToCopy,
        folderToCopyIn
    }
}

export function toggleFolderOpenClose(folder) {
    return {
        type: actionTypes.FOLDER_FOLD_TOGGLE,
        folder
    };
}
