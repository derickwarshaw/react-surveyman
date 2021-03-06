var React = require('react');
var cx = require('classnames');
var { DragSource, DropTarget } = require('react-dnd');
var ItemTypes = require('./ItemTypes');
var flow = require('lodash/function/flow');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var SurveyMan = require('../sub/surveyman.js/SurveyMan/surveyman');
var {Block} = SurveyMan.survey;

/* setup for dragging block node */
var nodeSource = {
  beginDrag(props) {
    return { id: props.id };
  }
};

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

/* setup for allowing blocks to act as drop targets
 * for questions */
var questionTarget = {
  drop(props, monitor) {
    let droppedOnChild = !monitor.isOver({shallow: false});
    if (!droppedOnChild) {
      props.handleDrop(monitor.getItem().id, props.id);
    }
  }
};

function dropCollect(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

/* setup for allowing blocks to act as drop target for other blocks.
 * this is required to implement sortable on blocks */
var blockTarget = {
  hover(props, monitor) {
    var draggedId = monitor.getItem().id;
    if (draggedId !== props.id) {
      props.moveBlock(draggedId, props.id);
    }
  },
  drop(props) {
    // called when the hover ends - used to propagate
    // changes upstream
    props.handleDrop(props.id, props.id);
  }
};

function sortCollect(connect) {
  return {
    connectSortTarget: connect.dropTarget()
  };
}

var BlockNode = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    collapsed: React.PropTypes.bool,
    defaultCollapsed: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    handleClick: React.PropTypes.func.isRequired,
    moveBlock: React.PropTypes.func,
    block: React.PropTypes.object.isRequired
  },
  getInitialState() {
    return {
      collapsed: this.props.defaultCollapsed || true
    };
  },
  handleCollapse() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },
  render() {
    var collapsed = this.props.collapsed != null ?
        this.props.collapsed : this.state.collapsed;

    var { isDragging,
        connectDragSource,
        id,
        connectDropTarget,
        connectSortTarget,
        handleClick,
        children } = this.props;

    var arrowClass = cx({
      'ion-arrow-down-b': !collapsed,
      'ion-arrow-right-b': collapsed
    });

    var arrow = (<div onClick={this.handleCollapse} className="tree-view_arrow">
      <i className={arrowClass}></i>
    </div>);

    return connectSortTarget(connectDragSource(connectDropTarget(
        <div className='tree-view_node-block' style={{opacity: isDragging ? 0 : 1}}> {arrow}
          <span className="tree-view_block-title" onClick={handleClick}>{"Block #" + id}</span>
          { collapsed ? null : <div className="tree-view_children">{children}</div> }
        </div>
    )));
  }
});

module.exports = flow(
    DragSource(ItemTypes.BLOCKNODE, nodeSource, dragCollect),
    DropTarget(ItemTypes.BLOCKNODE, blockTarget, sortCollect),
    DropTarget(ItemTypes.QUESTIONNODE, questionTarget, dropCollect)
)(BlockNode);
