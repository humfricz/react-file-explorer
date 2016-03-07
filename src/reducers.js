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

export default function reducers(state = {documentTree}, action) {
    switch(action.type) {
      case actionTypes.SORT:
      const {columnKey, sortDir} = action;
      let {contents} = state.documentTree;

      let sortedContents;
      if(state.lastSortBy === columnKey) {
        sortedContents = contents.reverse();
      } else {
        sortedContents = [..._.includes(['size', 'date', 'modified_time'], columnKey) ? numberSort(contents, columnKey) : letterSort(contents, columnKey)]
      }

      return {
        documentTree: _.assign({}, state.documentTree, {contents: sortedContents}),
        lastSortBy: columnKey,
        colSortDirs: {
          [columnKey]: sortDir,
        }
      };

      case actionTypes.MOVE_DOCUMENT:
      const {folderToCopyIn, documentToCopy} = action;
        var folderToActOn = this.getFolderFromPath(folderToCopyIn, state.documentTree.contents);
        if(!_.isArray(folderToCopyIn.contents)) {
          folderToActOn.contents = [];
        }

        folderToActOn.contents = folderToActOn.contents.concat(_.assign({}, documentToCopy, {path: folderToActOn.path.concat(folderToActOn.path.length)}));
        folderToActOn.foldedOut = true;

        return _.assign({}, state, {
          documentTree: _.assign({}, state.documentTree, {
            contents: sortedContents
          }),
        });
      case actionTypes.MOVE_DOCUMENT:
        var folderToActOn = this.getFolderFromPath(folderToCopyIn, state.documentTree.contents);
        if(!_.isArray(folderToCopyIn.contents)) {
          folderToActOn.contents = [];
        }

        folderToActOn.contents = folderToActOn.contents.concat(_.assign({}, documentToCopy, {path: folderToActOn.path.concat(folderToActOn.path.length)}));
        folderToActOn.foldedOut = true;

        return _.assign({}, state, {
          documentTree: _.assign({}, state.documentTree, {
            contents: sortedContents
          }),
        });
        tree = {path: [0], contents: [
          {path: [0,0], contents: [{path: [0,0,0], contents: []}]},
          {path: [0,1], contents: [{path: [0,1,0], contents: []}]}
        ]}
      case actionTypes.FOLDER_FOLD_TOGGLE:
        function toggleFolderOpenClose(path, tree) {
          if(path.length === 0) {
              return _.assign({}, tree, {foldedOut: !tree.foldedOut})
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
