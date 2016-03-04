import React from 'react';
import update from 'react/lib/update';
import classNames from 'classnames';
import moment from 'moment';
import FixedDataTable from 'fixed-data-table';
const {Table, Column, Cell} = FixedDataTable;
import { DragSource, DropTarget } from 'react-dnd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Mousetrap from 'mousetrap';
import keys from './keys';
import FileNameCell from './filenamecell';
import DragHandleCell from './draghandle';
import {getCommonClasses, truncateText} from './utils';
import SortHeaderCell from './sortheadercell';

const TextCell = ({rowIndex, data, columnKey, ...props}) => (
    <Cell {...props} onClick={() => props.onRowClick(rowIndex)} className={getCommonClasses(rowIndex, props.selectedFileIndex)}>
      {!props.transformationFunction ? data[rowIndex][columnKey] : props.transformationFunction(data[rowIndex][columnKey])}
    </Cell>
);

let Grid = React.createClass({
  propTypes: {
    enableKeyOps: React.PropTypes.bool,
    onKeyOps: React.PropTypes.func,
    toggleFolderOpenClose: React.PropTypes.func,
    onSortChange: React.PropTypes.func,
    data: React.PropTypes.array,
    colSortDirs: React.PropTypes.object,
    selectedFileIndex: React.PropTypes.number,
    onRowClick: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      enableKeyOps: true
    };
  },
  getInitialState() {
    return {
      columns: [
        {
          name: 'file_name',
          headerText: 'File Name',
          width: 450
        },
        {
          name: 'size',
          headerText: 'Size',
          width: 200
        },
        {
          name: 'modified_by_text',
          headerText: 'Modfied By',
          width: 200
        },
        {
          name: 'modified_time',
          headerText: 'Modified Time',
          width: 200
        },
        {
          name: 'description',
          headerText: 'Description',
          width: 300
        }
      ]
    };
  },
  componentDidMount() {
    if(this.props.enableKeyOps) {
      Mousetrap.bind(keys, this.handleKeyOps);
    }
  },
  componentWillUnmount(nextProps, nextState) {
    if(this.props.enableKeyOps) {
      Mousetrap.unbind(keys);
    }
  },
  handleSortChange(columnKey, sortDir) {
    if(this.props.onSortChange) {
      this.props.onSortChange(columnKey, sortDir);
    }
  },
  handleColumnResizeEnd(newColumnWidth, columnKey) {
    let {columns} = this.state;
    const colIndex = _.findIndex(columns, {name: columnKey});
    const changedColumn = _.assign({}, columns[colIndex], {width: newColumnWidth});

    this.setState({
      columns: [
        ...columns.slice(0, colIndex),
        changedColumn,
        ...columns.slice(colIndex + 1)
      ]
    });
  },
  handleKeyOps(e, combo) {
    if(this.props.onKeyOps) {
      this.props.onKeyOps(e, combo);
    }
  },
  toggleFolderOpenClose(data) {
    this.props.toggleFolderOpenClose(data);
  },
  handleRowClick(rowIndex) {
    this.props.onRowClick(rowIndex);
  },
  moveDocument(toMove, where) {
    this.props.onDocumentMove(toMove, where);
  },
  sizeCell() {
    return (
      <TextCell
              data={this.props.data}
              onRowClick={this.handleRowClick}
              selectedFileIndex={this.props.selectedFileIndex}
              />
    );
  },
  modifiedByTextCell() {
    return (
      <TextCell
              data={this.props.data}
              onRowClick={this.handleRowClick}
              selectedFileIndex={this.props.selectedFileIndex}
              />
    );
  },
  modifiedTimeCell(props) {
    return (
      <TextCell
              data={this.props.data}
              onRowClick={this.handleRowClick}
              selectedFileIndex={this.props.selectedFileIndex}
              transformationFunction={(time) => moment(time * 1000).format('ll')}
              />
    );
  },
  descriptionCell(props) {
    return (
      <TextCell
              data={this.props.data}
              onRowClick={this.handleRowClick}
              selectedFileIndex={this.props.selectedFileIndex}
              transformationFunction={truncateText}
              />
    );
  },
  fileNameCell() {
    return (
      <FileNameCell
              data={this.props.data}
              onRowClick={this.handleRowClick}
              toggleFolderOpenClose={this.toggleFolderOpenClose}
              selectedFileIndex={this.props.selectedFileIndex}
              onDocumentMove={this.moveDocument}
              />
    );
  },
  moveColumn(dragIndex, hoverIndex) {
    const dragColumn = this.state.columns[dragIndex];

    this.setState(update(this.state, {
      columns: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragColumn]
        ]
      }
    }));
  },
  getColumns() {
    const {colSortDirs} = this.props;

    return this.state.columns.map((column, index) => {
      return (
        <Column
          key={'column_' + index}
          columnKey={column.name}
          header={
            <SortHeaderCell
              index={index}
              moveColumn={this.moveColumn}
              onSortChange={this.handleSortChange}
              sortDir={colSortDirs[column.name]}>
              {column.headerText}
            </SortHeaderCell>
          }
          cell={this[_.camelCase(column.name) + 'Cell']()}
          width={column.width}
          isResizable={true}
          />
      )
    });
  },
  checkboxCell(props) {
    return <Cell><input type='checkbox' checked={props.rowIndex === this.props.selectedFileIndex || this.state.checkAll}/></Cell>
  },
  handleCheckAll() {
    this.setState({checkAll: !this.state.checkAll})
  },
  render() {
    const {colSortDirs} = this.props;
    const {columnWidths} = this.state;

    return (
      <Table
        rowsCount={this.props.data.length}
        rowHeight={50}
        headerHeight={50}
        width={1350}
        maxHeight={700}
        onColumnResizeEndCallback={this.handleColumnResizeEnd}
        isColumnResizing={false}
        >
        <Column
          header={<Cell></Cell>}
          cell={<DragHandleCell data={this.props.data}/>}
          width={30}
          />
        <Column
          header={<Cell><input type='checkbox' onClick={this.handleCheckAll}/></Cell>}
          cell={this.checkboxCell}
          width={30}
          />
        {this.getColumns()}
      </Table>
    )
  }
});

export default DragDropContext(HTML5Backend)(Grid);
