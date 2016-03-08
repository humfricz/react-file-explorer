import documentTree from './document_data';
import {actionTypes} from './actions';
import _ from 'lodash';
import {letterSort, numberSort} from './sorters';

function addPaths(fileData, index, path) {
  if(fileData.length <= index) {
    return;
  }

  fileData[index].path = path.concat(index);

  if(fileData[index].contents && fileData[index].contents.length > 0) {
    addPaths(fileData[index].contents, 0, fileData[index].path);
  }

  addPaths(fileData, index + 1, path);
}

function getFolderFromPath(folder, contents) {
  return folder.path.reduce((acc, pathIndex) => {
    if(_.isArray(acc)) {
      return acc[pathIndex];
    }

    return acc.contents[pathIndex];
  }, contents);
}

addPaths(documentTree.contents, 0, []);

function copyDocument(doc, path, tree) {
  if(!path || path.length === 0) {
    let contents = !_.isArray(tree.contents) ? [] : tree.contents;
    return _.assign({}, tree, {
      contents: contents.concat(_.assign({}, doc, {path: tree.path.concat(tree.path.length)}))
    })
  }

  return _.assign({}, tree, {
    contents: [
      ...tree.contents.slice(0, path[0]),
      copyDocument(doc, path.slice(1), tree.contents[path[0]]),
      ...tree.contents.slice(path[0]+1)
    ]
  })
}

function subtractOneFromPath(docs) {
  return docs.map((doc) => _.assign({}, doc, {path: [..._.dropRight(doc.path, 1), _.last(doc.path) - 1]}));
}

function deleteDocument(path, tree) {
  if(path.length === 1) {
    return _.assign({}, tree, {
      contents: [
        ...tree.contents.slice(0, path[0]),
        ...subtractOneFromPath(tree.contents.slice(path[0] + 1))
      ]
    })
  }

  return _.assign({}, tree, {
    contents: [
      ...tree.contents.slice(0, path[0]),
      deleteDocument(path.slice(1), tree.contents[path[0]]),
      ...tree.contents.slice(path[0]+1)
    ]
  })
}

function sortTree(tree, columnKey, lastSortBy) {
  let {contents} = tree;
  let sortedContents;
  if(lastSortBy === columnKey) {
    sortedContents = contents.reverse();
  } else {
    sortedContents = [..._.includes(['size', 'date', 'modified_time'], columnKey) ? numberSort(contents, columnKey) : letterSort(contents, columnKey)]
  }

  return _.assign({}, tree, {contents: sortedContents})
}

export default function reducers(state = {documentTree}, action) {
    switch(action.type) {
      case actionTypes.SORT:
        const {columnKey, sortDir} = action;

        return {
          documentTree: sortTree(state.documentTree, columnKey, state.lastSortBy),
          lastSortBy: columnKey,
          colSortDirs: {
            [columnKey]: sortDir,
          }
        };
      case actionTypes.COPY_DOCUMENT:
        return _.assign({}, state, {
          documentTree: copyDocument(action.documentToCopy, action.folderToCopyIn.path, state.documentTree),
        });
      case actionTypes.MOVE_DOCUMENT:
        return _.assign({}, state, {
          documentTree: deleteDocument(action.documentToMove.path, copyDocument(action.documentToMove, action.folderToCopyIn.path, state.documentTree)),
        });
      case actionTypes.FOLDER_FOLD_TOGGLE:
        if(!action.folder) {
          return state;
        }

        function toggleFolderOpenClose(path, tree) {
          if(!path || path.length === 0) {
              return _.assign({}, tree, {fold_out: !tree.fold_out})
          }

          return _.assign({}, tree, {contents: [
            ...tree.contents.slice(0, path[0]),
            toggleFolderOpenClose(path.slice(1), tree.contents[path[0]]),
            ...tree.contents.slice(path[0]+1)
          ]})
        }

        return _.assign({}, state, {
          documentTree: toggleFolderOpenClose(action.folder.path, state.documentTree)
        });
      default:
      return state;
    }
}
