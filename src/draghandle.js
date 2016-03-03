import React from 'react';
import FixedDataTable from 'fixed-data-table';
const {Cell} = FixedDataTable;
import {DragSource} from 'react-dnd';
import {getCommonClasses} from './utils';
import ItemTypes from './itemtypes';

const dragHandleSource = {
  beginDrag(props) {
    return props;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

let DragHandleCell = React.createClass({
  getInitialState() {
    return {
      showHandle: false
    };
  },
  handleMouseEnter(e) {
    this.setState({showHandle: true});
  },
  handleMouseOut(e) {
    this.setState({showHandle: true});
  },
  render() {
    const dragHandleImage = require('file!./images/drag_handle.jpg');
    let {rowIndex, data, columnKey, ...props} = this.props;
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div onMouseEnter={this.handleMouseEnter} onMouseOut={this.handleMouseOut}>
      <Cell
        {...props}
        style={{
          opacity: isDragging ? 0.5 : 1
        }}
        >
        <img className='drag-handle' src={dragHandleImage}></img>
      </Cell>
    </div>
    );
  }
});

export default DragSource(ItemTypes.DOCUMENT, dragHandleSource, collect)(DragHandleCell);
