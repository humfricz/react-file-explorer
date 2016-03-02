import React from 'react';
import FixedDataTable from 'fixed-data-table';
const {Cell} = FixedDataTable;

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

export default class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);

    this._onSortChange = this._onSortChange.bind(this);
  }

  render() {
    var {sortDir, children, ...props} = this.props;
    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
        </a>
      </Cell>
    );
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
