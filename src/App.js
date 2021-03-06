import React, { Component } from 'react';
import {mouseTrap} from 'react-mousetrap';
import Grid from './grid';
import 'fixed-data-table/dist/fixed-data-table-base.css';
import 'fixed-data-table/dist/fixed-data-table-style.css';
import './style.css';
import documentData from './document_data';
import {letterSort, numberSort} from './sorters';
import _ from 'lodash';
import {getFileSizeString} from './utils';
import {connect} from 'react-redux';
import {sortDocuments, moveDocument, copyDocument, toggleFolderOpenClose} from './actions';

let clipBoard;

function _flatten(hData, acc) {
  if(hData.length === 0) {
    return acc;
  }

  return hData.reduce((acc2, item) => {
    if(!item.fold_out) {
      return acc2.concat(item);
    }

    return acc2.concat(item).concat(flatten(item.contents));
  }, []);
}

function flatten(hData) {
  return _flatten(hData, []);
}

let App = React.createClass({
  getInitialState() {
    return {
      data: this.props.documentTree.contents.map((item) => {
        return _.assign({}, item, {indentLevel: 0});
      }),
      colSortDirs: {},
      selectedFileIndex: -1
    };
  },
  getFolderFromPath(folder) {
    return folder.path.reduce((acc, pathIndex) => {
                          if(_.isArray(acc)) {
                            return acc[pathIndex];
                          }

                          return acc.contents[pathIndex];
                        }, this.state.heirarchicalData);
  },
  handleKeydown(e, combo) {
    switch(combo) {
      case 'up': //UP
      if(this.state.selectedFileIndex > 0) {
        this.setState({selectedFileIndex: this.state.selectedFileIndex - 1});
      }
      if(this.state.selectedFileIndex === -1) {
        this.setState({selectedFileIndex: 0});
      }
      break;

      case 'down': //DOWN
      if(this.state.selectedFileIndex < this.state.data.length) {
        this.setState({selectedFileIndex: this.state.selectedFileIndex + 1});
      }
      if(this.state.selectedFileIndex === -1) {
        this.setState({selectedFileIndex: 0});
      }
      break;

      case 'left': //LEFT
      if(this.state.data[this.state.selectedFileIndex].fold_out && this.state.data[this.state.selectedFileIndex].type === 'Folder') {
        this.props.toggleFolderOpenClose(this.state.data[this.state.selectedFileIndex]);
      }
      break;

      case 'right': //RIGHT
      if(!this.state.data[this.state.selectedFileIndex].fold_out && this.state.data[this.state.selectedFileIndex].type === 'Folder') {
        this.props.toggleFolderOpenClose(this.state.data[this.state.selectedFileIndex]);
      }
      break;

      case 'ctrl+c':
      case 'command+c':
      clipBoard = this.state.data[this.state.selectedFileIndex];
      this.setState({lastCopyAction: 'copy'});
      break;

      case 'ctrl+x':
      case 'command+x':
      clipBoard = this.state.data[this.state.selectedFileIndex];
      this.setState({lastCopyAction: 'move'});
      break;

      case 'ctrl+v':
      case 'command+v':
      // if nothing in clipboard or pasting in the same place
      if(!clipBoard || clipBoard.id === this.state.data[this.state.selectedFileIndex].id) {
        return;
      }

      // can't paste if the current selection is not a folder
      if(this.state.data[this.state.selectedFileIndex].type !== 'Folder') {
        return;
      }

      if(this.state.lastCopyAction === 'move') {
        this.props.moveDocument(clipBoard, this.state.data[this.state.selectedFileIndex]);
      } else {
        this.props.copyDocument(clipBoard, this.state.data[this.state.selectedFileIndex]);
      }

      break;
    }
  },
  getCommonClasses(rowIndex) {
    return classNames('selectable', {
      selected: this.state.selectedFileIndex === rowIndex
    });
  },
  handleRowClick(rowIndex) {
    this.setState({selectedFileIndex: rowIndex});
  },
  fileNameCell(props) {
    function getCaret(data, index) {
      if(data[index + 1] && data[index + 1].path.length > data[index].path.length) {
        return '\u25BC';
      }

      return '\u25BA';
    }


    return (
      <Cell {...props} onClick={this.handleRowClick.bind(this, props.rowIndex)} className={this.getCommonClasses(props.rowIndex)}>
        <span style={{paddingLeft: (this.state.data[props.rowIndex].path.length-1)*20}}/>
        {this.state.data[props.rowIndex].type === 'Folder' ?
          <span onClick={this.toggleFolderOpenClose.bind(this, this.state.data[props.rowIndex], props)}>{getCaret(this.state.data, props.rowIndex)} </span>
          : ''
        }{this.state.data[props.rowIndex].file_name}
      </Cell>
    )
  },
  sizeCell(props) {
    return (
      <Cell {...props} onClick={this.handleRowClick.bind(this, props.rowIndex)} className={this.getCommonClasses(props.rowIndex)}>
        {this.state.data[props.rowIndex].size_text}
      </Cell>
    )
  },
  modifiedByCell(props) {
    return (
      <Cell {...props} onClick={this.handleRowClick.bind(this, props.rowIndex)} className={this.getCommonClasses(props.rowIndex)} style={{color: 'red'}}>
        {this.state.data[props.rowIndex].modified_by_text}
      </Cell>
    )
  },
  dateCell(props) {
    return (
      <Cell {...props} onClick={this.handleRowClick.bind(this, props.rowIndex)} className={this.getCommonClasses(props.rowIndex)}>
        {moment(this.state.data[props.rowIndex].modified_time * 1000).format('ll')}
      </Cell>
    )
  },
  descriptionCell(props) {
    return (
      <Cell {...props} onClick={this.handleRowClick.bind(this, props.rowIndex)} className={this.getCommonClasses(props.rowIndex)}>
        {truncateText(this.state.data[props.rowIndex].description)}
      </Cell>
    );
  },
  componentWillReceiveProps(nextProps) {
    if(nextProps.documentTree !== this.props.documentTree) {
      this.setState({data: flatten(nextProps.documentTree.contents)});
    }
  },
  render() {
    const {onSortChange, colSortDirs, moveDocument, copyDocument, toggleFolderOpenClose} = this.props;
    const dragHandleImage = require('file!./images/drag_handle.jpg');

    return (
      <Grid
        enableKeyOps={true}
        onKeyOps={this.handleKeydown}
        toggleFolderOpenClose={toggleFolderOpenClose}
        onSortChange={onSortChange}
        data={this.state.data}
        colSortDirs={this.state.colSortDirs}
        selectedFileIndex={this.state.selectedFileIndex}
        onRowClick={this.handleRowClick}
        onDocumentMove={moveDocument}
        ></Grid>
    )
  }
});

function mapStateToProps(state) {
  return {
    documentTree: state.documentTree,
    colSortDirs: state.colSortDirs
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onSortChange: (columnKey, sortDir) => dispatch(sortDocuments(columnKey, sortDir)),
    moveDocument: (documentToCopy, folderToCopyIn) => dispatch(moveDocument(documentToCopy, folderToCopyIn)),
    copyDocument: (documentToCopy, folderToCopyIn) => dispatch(copyDocument(documentToCopy, folderToCopyIn)),
    toggleFolderOpenClose: (folder) => dispatch(toggleFolderOpenClose(folder))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
