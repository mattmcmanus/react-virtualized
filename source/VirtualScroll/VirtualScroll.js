/** @flow */
import Grid from '../Grid'
import React, { Component, PropTypes } from 'react'
import cn from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

/**
 * It is inefficient to create and manage a large list of DOM elements within a scrolling container
 * if only a few of those elements are visible. The primary purpose of this component is to improve
 * performance by only rendering the DOM nodes that a user is able to see based on their current
 * scroll position.
 *
 * This component renders a virtualized list of elements with either fixed or dynamic heights.
 */
export default class VirtualScroll extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,

    /**
     * Removes fixed height from the scrollingContainer so that the total height
     * of rows can stretch the window. Intended for use with WindowScroller
     */
    autoHeight: PropTypes.bool,

    /** Optional CSS class name */
    className: PropTypes.string,

    /**
     * Used to estimate the total height of a VirtualScroll before all of its rows have actually been measured.
     * The estimated total height is adjusted as rows are rendered.
     */
    estimatedRowSize: PropTypes.number.isRequired,

    /** Height constraint for list (determines how many actual rows are rendered) */
    height: PropTypes.number.isRequired,

    /** Optional renderer to be used in place of rows when rowCount is 0 */
    noRowsRenderer: PropTypes.func.isRequired,

    /**
     * Callback invoked with information about the slice of rows that were just rendered.
     * ({ startIndex, stopIndex }): void
     */
    onRowsRendered: PropTypes.func.isRequired,

    /**
     * Number of rows to render above/below the visible bounds of the list.
     * These rows can help for smoother scrolling on touch devices.
     */
    overscanRowCount: PropTypes.number.isRequired,

    /**
     * Callback invoked whenever the scroll offset changes within the inner scrollable region.
     * This callback can be used to sync scrolling between lists, tables, or grids.
     * ({ clientHeight, scrollHeight, scrollTop }): void
     */
    onScroll: PropTypes.func.isRequired,

    /**
     * Either a fixed row height (number) or a function that returns the height of a row given its index.
     * ({ index: number }): number
     */
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,

    /** Responsbile for rendering a row given an index; ({ index: number }): node */
    rowRenderer: PropTypes.func.isRequired,

    /** Optional custom CSS class for individual rows */
    rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Number of rows in list. */
    rowCount: PropTypes.number.isRequired,

    /** Optional custom styles for individual cells */
    rowStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

    /** See Grid#scrollToAlignment */
    scrollToAlignment: PropTypes.oneOf(['auto', 'end', 'start', 'center']).isRequired,

    /** Row index to ensure visible (by forcefully scrolling if necessary) */
    scrollToIndex: PropTypes.number,

    /** Vertical offset. */
    scrollTop: PropTypes.number,

    /** Optional inline style */
    style: PropTypes.object,

    /** Width of list */
    width: PropTypes.number.isRequired
  }

  static defaultProps = {
    estimatedRowSize: 30,
    noRowsRenderer: () => null,
    onRowsRendered: () => null,
    onScroll: () => null,
    overscanRowCount: 10,
    scrollToAlignment: 'auto',
    style: {}
  }

  constructor (props, context) {
    super(props, context)

    this._wrapIndexGetter = this._wrapIndexGetter.bind(this)
  }

  /** See Grid#measureAllCells */
  measureAllRows () {
    this.refs.Grid.measureAllCells()
  }

  /** See Grid#recomputeGridSize */
  recomputeRowHeights () {
    this.refs.Grid.recomputeGridSize()
  }

  render () {
    const {
      className,
      estimatedRowSize,
      height,
      noRowsRenderer,
      onRowsRendered,
      onScroll,
      rowHeight,
      rowRenderer,
      overscanRowCount,
      autoHeight,
      rowClassName,
      rowCount,
      rowStyle,
      scrollToAlignment,
      scrollToIndex,
      scrollTop,
      style,
      width
    } = this.props

    const classNames = cn('VirtualScroll', className)
    const cellClassName = this._wrapIndexGetter(rowClassName)
    const cellStyle = this._wrapIndexGetter(rowStyle)

    return (
      <Grid
        ref='Grid'
        aria-label={this.props['aria-label']}
        className={classNames}
        cellRenderer={({ columnIndex, isScrolling, rowIndex }) => rowRenderer({
          index: rowIndex,
          isScrolling
        })}
        cellClassName={cellClassName}
        cellStyle={cellStyle}
        columnWidth={width}
        columnCount={1}
        estimatedRowSize={estimatedRowSize}
        height={height}
        noContentRenderer={noRowsRenderer}
        onScroll={({ clientHeight, scrollHeight, scrollTop }) => onScroll({ clientHeight, scrollHeight, scrollTop })}
        onSectionRendered={({ rowOverscanStartIndex, rowOverscanStopIndex, rowStartIndex, rowStopIndex }) => onRowsRendered({
          overscanStartIndex: rowOverscanStartIndex,
          overscanStopIndex: rowOverscanStopIndex,
          startIndex: rowStartIndex,
          stopIndex: rowStopIndex
        })}
        overscanRowCount={overscanRowCount}
        autoHeight={autoHeight}
        rowHeight={rowHeight}
        rowCount={rowCount}
        scrollToAlignment={scrollToAlignment}
        scrollToRow={scrollToIndex}
        scrollTop={scrollTop}
        style={style}
        width={width}
      />
    )
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  _wrapIndexGetter (value) {
    return value instanceof Function
      ? ({ rowIndex }) => value({ index: rowIndex })
      : () => value
  }
}
