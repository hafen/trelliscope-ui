import React from 'react'
import Radium from 'radium'
import appStore from '../stores/appStore'
import appActions from '../actions/appActions'

import FlatButton from 'material-ui/lib/flat-button'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

var SideButtons = React.createClass({
  getInitialState: function() {
    return {
      cfg: appStore.getAppConfig(),
      activeSidebar: appStore.getActiveSidebar()
    }
  },
  componentDidMount: function() {
    appStore.addChangeListener(this._onChange)
  },
  componentWillUnmount: function() {
    appStore.removeChangeListener(this._onChange)
  },
  _onChange: function() {
    this.setState({
      cfg: appStore.getAppConfig(),
      activeSidebar: appStore.getActiveSidebar()
    })
  },
  _handleMouseDown: function(val, e) {
    appActions.setActiveSidebar(val)
    e.preventDefault()
  },
  render: function() {
    var styles = {
      container: {
        background: this.state.cfg.sideButtons.background,
        position: 'absolute',
        height: '100%'
      },
      iconButton: {
        width: '46px',
        height: '46px',
        lineHeight: '46px',
        textAlign: 'center',
        verticalAlign: 'middle',
        fontSize: '22px',
        // textTransform: 'auto',
        color: 'white',
        borderBottom: '1px solid #c0c0c0',
        userSelect: 'none',
        transition: 'color 0.25s ease, background 0.25s ease',
        ':hover': {
          background: '#999',
          cursor: 'pointer'
        }
      },
      activeButton: {
        background: 'white',
        color: '#666',
        ':hover': {
          background: 'white',
        }
      },
      spacer: {
        background: this.state.cfg.sideButtons.spacer,
        transition: 'height 0.2s',
        height: '0px'
      },
      activeSpacer: {
        transition: 'height 0.25s',
        height: this.state.cfg.sideHeaderHeight
      },
      logo: {
        position: 'absolute',
        bottom: '0px',
        left: '0',
        width: '46px',
        height: '46px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        color: '#ccc',
        textAlign: 'center',
        lineHeight: '45px',
      }
    }

    var buttons = [
      { icon: 'fa fa-filter', ref: 'filter', title: 'Filter' },
      { icon: 'fa fa-sort-amount-asc', ref: 'sort', title: 'Sort' },
      { icon: 'fa fa-list-ul', ref: 'labels', title: 'Labels' }
    ];

    var buttonElems = []
    for (var i = 0; i < buttons.length; i++) {
      var d = buttons[i]
      var active = this.state.activeSidebar === d.ref
      buttonElems.push (
        <div style={[styles.iconButton, active && styles.activeButton]}
          key={d.ref + '-button'} type='button'
          onMouseDown={this._handleMouseDown.bind(this, d.ref)}
        >
          <i className={d.icon}></i>
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <div style={[styles.spacer, this.state.activeSidebar && styles.activeSpacer]}
        key='button-spacer'></div>
        {buttonElems}
        <div style={styles.logo}>logo</div>
      </div>
    )
  }
})

export default Radium(SideButtons)
