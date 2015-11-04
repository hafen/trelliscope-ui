// behaviors:
// - click on a bar selects it
// - multiple bars can be selected with additional clicks
// - click on a selected bar deselects it
// - click outside a bar deselects everything
// - click and drag on bars selects everything the cursor comes across
// - (click and drag to deselect is not an option)
// - regex overrides manual selections
// - if selections are made after regex, regex is cleared
// - gray scroll boxes appear on either end if there are bars outside region
// - hover on scroll boxes advances in the direction of the box
// -   (TODO: scrolling should speed up the longer it is hovered)
// - click on scroll boxes advances to the beginning / end
// - sorting resets scroll to start
// - mousewheel scrolls boxes left and right (TODO: look into throttle for this)

// perhaps clicking on scroll bar should just page once instead of jump to end

import d3 from 'd3'
import React from 'react'
import Radium from 'radium'
import debounce from 'debounce'
import appStore from '../stores/appStore'
import appActions from '../actions/appActions'
// begin material-ui components
import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import IconButton from 'material-ui/lib/icon-button'
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert'
import TextField from 'material-ui/lib/text-field'
import ThemeManager from 'material-ui/lib/styles/theme-manager'
import LightRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme'
import Colors from 'material-ui/lib/styles/colors'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();
// end material-ui components

var CatFilter = React.createClass({
  getInitialState: function() {
    return {
      cfg: appStore.getAppConfig(),
      data: appStore.getCogMeta()[this.props.name].plotData,
      filter: appStore.getCogState()[this.props.name].filter,
      barMousedown: false,
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme)
    }
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },
  componentDidMount: function() {
    appStore.addChangeListener(this._onChange)
  },
  componentWillMount: function() {
    this._handleRegex = debounce(this._handleRegex, 200);
    // this._handleWheel = debounce(this._handleWheel, 50);

    // https://github.com/callemall/material-ui/blob/master/src/styles/theme-manager.js
    var newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      primary1Color: Colors.blue200,
      accent1Color: Colors.blue200
    });
    this.setState({muiTheme: newMuiTheme});
  },
  componentWillUnmount: function() {
    appStore.removeChangeListener(this._onChange)
  },
  _onChange: function() {
    this.setState({
      cfg: appStore.getAppConfig(),
      data: appStore.getCogMeta()[this.props.name].plotData,
      filter: appStore.getCogState()[this.props.name].filter
    })
  },
  _mouseDown: function(e) {
    appActions.selectNone(this.props.name)
    this.refs.regexInput.clearValue() // clear regex
  },
  _mouseLeave: function() {
    // if mouse leaves box but is still down, set mousedown to false
    this._handleBarMousedown(false)
  },
  _wheel: function(e) {
    // console.log(e.deltaY)
    this._handleWheel(e.deltaY)
    e.preventDefault()
  },
  _handleWheel: function(val) {
    if(val > 1) {
      this._handleScroll(1)
    } else if(val < -1) {
      this._handleScroll(-1)
    }
  },
  _handleToggleSelect: function(data) {
    appActions.handleFilterSelect({name: this.props.name, data: data})

    this.refs.regexInput.clearValue() // clear regex
  },
  _handleScroll: function(val) {
    var end = Math.max(this.state.data.length - this.state.cfg.filter.maxBars, 0)
    var res = Math.max(Math.min(this.state.filter.startIndex + val, end), 0)
    appActions.setFilterStartIndex({name: this.props.name, val: res})
  },
  _handleBarMousedown: function(val) {
    this.setState({barMousedown: val})
  },
  _handleSort: function(e, value) {
    appActions.handleFilterOrder({name: this.props.name, val: value})
  },
  _handleRegex: function(e) {
    appActions.handleFilterRegex({name: this.props.name, rgx: e.target.value})
  },
  _handleDeactivate: function() {
    appActions.toggleActiveFilter(this.props.name)
  },
  _handleReset: function() {
    appActions.filterReset(this.props.name)
    this.refs.regexInput.clearValue() // clear regex
  },
  render: function() {
    if (!this.state.data)
      return <div className={'message'}>No data...</div>

    var barWidth = this.state.cfg.filter.width / d3.min([this.state.cfg.filter.maxBars, this.state.data.length])
    var maxHeight = d3.max(this.state.data.map(function(d) {return d.ct}))
    var fontSize = d3.min([12, barWidth - 4])

    // window.d3 = d3
    // window.data = this.state.data

    var styles = {
      container: {
        width: this.state.cfg.filter.width + 10,
        // display: 'inline-block',
        // for dropdowns to not be hidden under other elements:
        zIndex: 100 + this.props.index,
        position: 'relative'
      },
      innerContainer: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5
      },
      plotContainer: {
        width: this.state.cfg.filter.width,
        height: this.state.cfg.filter.height,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        userSelect: 'none',
        zIndex: 1000
      },
      inputContainer: {
        width: this.state.cfg.filter.width,
        marginBottom: '-14px',
        zIndex: 100,
        position: 'relative'
      },
      regexInput: {
        width: this.state.cfg.filter.width - 30,
        marginTop: -8,
        fontSize: '16px',
        transform: 'scale(0.85)',
        transformOrigin: '0 0'
      },
      extraOptionsInput: {
        float: 'right',
        width: 28,
        marginTop: -6,
        transform: 'scale(0.85)',
        transformOrigin: '0 0'
      },
      footer: {
        height: '16px',
        lineHeight: '15px',
        width: this.state.cfg.filter.width + 10,
        borderBottom: this.state.cfg.filter.footerBorder,
        marginTop: '5px',
        fontSize: '12px',
        position: 'relative',
        background: this.state.cfg.filter.footerBackground
      },
      footerName: {
        height: '16px',
        paddingLeft: '5px',
        paddingRight: '5px',
        position: 'absolute',
        right: 0,
        userSelect: 'none',
        cursor: 'default',
        background: 'lightgray'
      },
      footerIcon: {
        height: '16px',
        color: '#666',
        cursor: 'pointer',
        position: 'absolute',
        zIndex: 1000
      },
      footerClose: {
        left: 5
      },
      footerReset: {
        left: 18
      }
    }

    var extraOptionsItems = [
      { payload: 'idx,asc', text: 'Order: default' },
      { payload: 'ct,asc', text: 'Order: count ascending' },
      { payload: 'ct,desc', text: 'Order: count descending' },
      { payload: 'id,asc', text: 'Order: label ascending' },
      { payload: 'id,desc', text: 'Order: label descending' },
    ];

    var iconButtonElement = <IconButton><MoreVertIcon /></IconButton>;
    var extraOptionsInput = (
      <IconMenu iconButtonElement={iconButtonElement}
        value={this.state.filter.orderValue}
        desktop={true}
        openDirection='bottom-right'
        style={styles.extraOptionsInput} key='extraOptionsInput'
        onChange={this._handleSort}>
        {extraOptionsItems.map(function(d) {
          return(<MenuItem primaryText={d.text} value={d.payload} key={d.payload} />)
        })}
      </IconMenu> )

    var bars = []
    var nn = Math.min(this.state.cfg.filter.maxBars, this.state.data.length)

    for (var i = 0; i < nn; i++) {
      var d = this.state.data[this.state.filter.orderIndex[i + this.state.filter.startIndex]]
      bars.push (
        <CatBar key={d.id} k={d.id} d={d}
          key={'bar_' + d.id}
          left={i * barWidth}
          width={barWidth - 1}
          barColors={this.state.cfg.barColors}
          bottom={0}
          height={this.state.cfg.filter.height * d.ct / maxHeight}
          fontSize={fontSize}
          selected={this.state.filter.selected[d.id]}
          toggle={this._handleToggleSelect}
          mousedown={this.state.barMousedown}
          setmousedown={this._handleBarMousedown}
        />
      )
    }

    var endIndex = Math.max(this.state.data.length - this.state.cfg.filter.maxBars, 0)

    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.plotContainer}
            onMouseDown={this._mouseDown}
            onMouseLeave={this._mouseLeave}
            onWheel={this._wheel}>
            {bars}
            <CatScroll side={'left'} setScroll={this._handleScroll}
              key='leftScroll'
              width={this.state.cfg.filter.scrollWidth}
              startIndex={this.state.filter.startIndex}
              endIndex={endIndex}/>
            <CatScroll side={'right'} setScroll={this._handleScroll}
              key='rightScroll'
              width={this.state.cfg.filter.scrollWidth}
              startIndex={this.state.filter.startIndex}
              endIndex={endIndex}/>
          </div>
          <div style={styles.inputContainer}>
            <TextField hintText='regex' ref='regexInput' key='regexInput'
              style={styles.regexInput} desktop={true}
              defaultValue={this.state.regex}
              onChange={this._handleRegex}
            />
            {extraOptionsInput}
          </div>
        </div>
        <div style={styles.footer}>
          <div
            style={[styles.footerIcon, styles.footerClose]}
            onMouseDown={this._handleDeactivate}
          >
            <i className='fa fa-times-circle'></i>
          </div>
          <div
            style={[styles.footerIcon, styles.footerReset]}
            onMouseDown={this._handleReset}
          >
            <i className='fa fa-undo'></i>
          </div>
          <div style={styles.footerName}>{this.props.name}</div>
        </div>
      </div>
    )
  }
})

var CatBar = React.createClass({
  getInitialState: function () {
    return {
      hover: false
    }
  },
  _mouseOver: function (e) {
    this.setState({hover: true})
    // console.log(this.props.mousedown)
    if(this.props.mousedown) {
      this.props.toggle({id: this.props.d.id, set: true})
    }
  },
  _mouseOut: function (e) {
    this.setState({hover: false})
  },
  _mouseDown: function(e) {
    this.props.setmousedown(true)
    this.props.toggle({id: this.props.d.id, set: false})
    e.stopPropagation()
  },
  _mouseUp: function(e) {
    this.props.setmousedown(false)
    e.stopPropagation()
  },
  render: function() {
    var barClass = 'cat-bar'
    if (this.state.hover)
      barClass = barClass + ' hover'
    if (this.props.selected)
      barClass = barClass + ' selected'

    var styles = {
      bar: {
        backgroundColor: this.props.barColors.default,
        position: 'absolute',
        left: this.props.left,
        width: this.props.width,
        bottom: this.props.bottom,
        height: this.props.height
      },
      barHover: {
        backgroundColor: this.props.barColors.hover
      },
      barSelect: {
        backgroundColor: this.props.barColors.select
      },
      barLabel: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
        cursor: 'default'
      },
      hidden: {
        visibility: 'hidden'
      },
      barText: {
        display: 'inline-block',
        overflow: 'hidden',
        cursor: 'default',
        width: this.props.width
      },
      barTextInner: {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        transform: 'translate(0,100%) rotate(-90deg)',
        transformOrigin: '0 0',
        position: 'absolute',
        bottom: '5px',
        lineHeight: Math.round(this.props.width) + 'px',
        fontSize: this.props.fontSize
      }
    }

    return(
      <div style={[
          styles.bar,
          this.state.hover && styles.barHover,
          this.props.selected && styles.barSelect
        ]}
        onMouseOver={this._mouseOver}
        onMouseOut={this._mouseOut}
        onMouseDown={this._mouseDown}
        onMouseUp={this._mouseUp}
      >
        <div style={[
          styles.barLabel,
          !this.state.hover && styles.hidden
        ]}>{this.props.d.ct}</div>
        <div style={styles.barText}>
          <div style={styles.barTextInner}>{this.props.d.id}</div>
        </div>
      </div>
    )
  }
})

CatBar = Radium(CatBar)

var CatScroll = React.createClass({
  getInitialState: function () {
    return { scrollTimer: null }
  },
  _mouseOver: function () {
    var val = -1
    if(this.props.side === 'right')
      val = 1
    var f = this.props.setScroll
    this.state.scrollTimer = setInterval(function() {f(val)}, 100)
  },
  _mouseOut: function () {
    clearTimeout(this.state.scrollTimer)
  },
  _mouseDown: function(e) {
    var val = -100000
    if(this.props.side === 'right')
      val = 100000
    this.props.setScroll(val)
    e.stopPropagation()
  },
  render: function() {
    var styles = {
      scrollBar: {
        position: 'absolute',
        backgroundColor: 'gray',
        opacity: '0.4',
        height: '100%',
        cursor: 'pointer',
        transition: '0.3s',
        width: this.props.width
      },
      hidden: {
        opacity: 0,
        visibility: 'hidden',
        transition: '0.3s'
      }
    }
    if(this.props.side === 'left') {
      styles.scrollBar.left = 0
    } else {
      styles.scrollBar.right = 0
    }

    var hide = false
    if(this.props.startIndex === 0 && this.props.side === 'left')
      hide = true
    if(this.props.startIndex === this.props.endIndex && this.props.side === 'right')
      hide = true

    return (
      <div style={[styles.scrollBar, hide && styles.hidden]}
        onMouseDown={this._mouseDown}
        onMouseOver={this._mouseOver}
        onMouseOut={this._mouseOut}>
      </div>
    )
  }
})

CatScroll = Radium(CatScroll)

export default Radium(CatFilter)
