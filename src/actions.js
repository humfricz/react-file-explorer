export const actionTypes = {
    SORT: 'SORT',
    MOVE_DOCUMENT: 'MOVE_DOCUMENT',
    COPY_DOCUMENT: 'COPY_DOCUMENT',
    FOLDER_FOLD_TOGGLE: 'FOLDER_FOLD_TOGGLE',
    GET_IN_FOLDER: 'GET_IN_FOLDER'
};

export function sortDocuments(columnKey, sortDir) {
    return {
        type: actionTypes.SORT,
        columnKey,
        sortDir
    };
}

export function moveDocument(documentToMove, folderToCopyIn) {
    return {
        type: actionTypes.MOVE_DOCUMENT,
        documentToMove,
        folderToCopyIn
    }
}

export function copyDocument(documentToCopy, folderToCopyIn) {
    return {
        type: actionTypes.COPY_DOCUMENT,
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

export function getInFolder(folder) {
    return {
        type: itemTypes.GET_IN_FOLDER,
        folder
    };
}
