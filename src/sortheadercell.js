import React from 'react';
import { findDOMNode } from 'react-dom';
import FixedDataTable from 'fixed-data-table';
const {Cell} = FixedDataTable;
import ItemTypes from './itemtypes';
import { DragSource, DropTarget } from 'react-dnd';

const style = {
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
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) * 2/ 3;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    // Only perform the move when the mouse has crossed half of the items width
    // When dragging downwards, only move when the cursor is right 50%
    // When dragging left, only move when the cursor is left 50%

    // Dragging right
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return;
    }

    // Dragging left
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
    const opacity = isDragging ? 0.2 : 1;

    return connectDragSource(connectDropTarget(
      <div style={{...style, opacity}}>
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
