import React from 'react';
import classNames from 'classnames';
import FixedDataTable from 'fixed-data-table';
const {Cell} = FixedDataTable;
import {DropTarget} from 'react-dnd';
import {getCommonClasses} from './utils';
import ItemTypes from './itemtypes';

const documentTarget = {
  canDrop(props) {
    return props.data[props.rowIndex].type === 'Folder';
  },
  drop(props, monitor) {
    let documentToMove = monitor.getItem();
    props.onDocumentMove(documentToMove.data[documentToMove.rowIndex], props.data[props.rowIndex]);
  }
};

function collectForDropTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

let FileNameCell = React.createClass({
  handleRowClick(rowIndex) {
    this.props.onRowClick(rowIndex);
  },
  toggleFolderOpenClose(data, props) {
    this.props.toggleFolderOpenClose(data, props);
  },
  render() {
    let {rowIndex, data, columnKey, selectedFileIndex, ...props} = this.props;
    let {connectDropTarget, isOver} = this.props;

    function getCaret(data, index) {
      if(data[index + 1] && data[index + 1].path.length > data[index].path.length) {
        return '\u25BC';
      }

      return '\u25BA';
    }

    const style = {
      opacity: isOver ? 0.5 : 1,
      background: isOver ? 'green' : 'white',
      // borderTop: isOver ? '2px solid green' : 'none'
    };

    return connectDropTarget(
      <div
        style={style}>
        <Cell {...props} onClick={this.handleRowClick.bind(this, rowIndex)} className={getCommonClasses(rowIndex, selectedFileIndex)}>
          <span style={{paddingLeft: (this.props.data[rowIndex].path.length-1)*20}}/>
          {data[rowIndex].type === 'Folder' ?
            <span onClick={this.toggleFolderOpenClose.bind(this, data[rowIndex], props)}>{getCaret(data, rowIndex)} </span>
            : ''
          }{data[rowIndex].file_name}
        </Cell>
      </div>
    )
  }
});

export default DropTarget(ItemTypes.DOCUMENT, documentTarget, collectForDropTarget)(FileNameCell);
