import React from 'react';
import { findDOMNode } from 'react-dom';
import FixedDataTable from 'fixed-data-table';
const {Cell} = FixedDataTable;
import ItemTypes from './itemtypes';
import { DragSource, DropTarget } from 'react-dnd';

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  headerTarget: 'white',
  cursor: 'move'
};

const headerSource = {
  beginDrag(props) {
    console.log('props: ', props);
    return {
      columnKey: props.columnKey,
      index: props.index
    };
  }
};

const headerTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
console.log('dragIndex: ', dragIndex, ' hoverIndex: ', hoverIndex);
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
console.log('hoverMiddleX: ', hoverMiddleX);
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Get pixels to the left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
console.log('hoverClientX: ', hoverClientX);
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return;
    }

    // Time to actually perform the action
    props.moveColumn(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

// const dragHandleSource = {
//   beginDrag(props) {
//     return props;
//   }
// };

const SortTypes = {
  ASC: 'asc',
  DESC: 'desc'
};

function reverseSortDirection(sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);

    this._onSortChange = this._onSortChange.bind(this);
  }

  render() {
    const { text, isDragging, connectDragSource, connectDropTarget } = this.props;
    var {sortDir, children, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <div style={{opacity: isDragging ? 0.2 : 1}}>
        <Cell {...props}>
          <a onClick={this._onSortChange}>
            {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
          </a>
        </Cell>
      </div>
    ));
  }

  _onSortChange(e) {
    e.preventDefault();

    if (this.props.onSortChange) {
      this.props.onSortChange(
        this.props.columnKey,
        this.props.sortDir ?
          reverseSortDirection(this.props.sortDir) :
          SortTypes.DESC
      );
    }
  }
}


SortHeaderCell = DropTarget(ItemTypes.HEADER, headerTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(SortHeaderCell);

SortHeaderCell = DragSource(ItemTypes.HEADER, headerSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(SortHeaderCell);

export default SortHeaderCell;
