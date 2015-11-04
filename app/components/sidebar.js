import React from 'react'
import Radium from 'radium'
import appStore from '../stores/appStore'
import appActions from '../actions/appActions'
import FilterSidebar from '../components/filterSidebar'

var Sidebar = React.createClass({
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
  render: function() {
    var styles = {
      wrapper: {
        visibility: 'visible',
        opacity: 1,
        transition: 'opacity 0.25s ease, visibility 0.5s ease'
        // transitionDelay: '0.25s'
      },
      wrapperHidden: {
        visibility: 'hidden',
        opacity: 0,
        transition: 'opacity 0.25s ease, visibility 0.5s ease'
      },
      header: {
        padding: '2px 6px',
        background: '#c1c1c1',
        color: 'white',
        fontSize: '14px',
        height: '20px',
        lineHeight: '20px',
        verticalAlign: 'middle'
        // textTransform: 'auto'
        // text-align: center,
        // font-weight: 400
      }
    }

    if(!this.state.activeSidebar) {
      return <div style={[styles.wrapper, styles.wrapperHidden]}></div>
    }

    var content = null

    if(this.state.activeSidebar === 'filter') {
      content = <FilterSidebar />
    } else if(this.state.activeSidebar === 'sort') {
      content = 'sort stuff'
    } else if(this.state.activeSidebar === 'labels') {
      content = 'filter stuff'
    }

    var label = this.state.activeSidebar
    label = label.charAt(0).toUpperCase() + label.slice(1)
    return (
      <div id='sidebar-content' style={styles.wrapper}>
        <div style={styles.header}>{label}</div>
        {content}
      </div>
    )
  }
})

export default Radium(Sidebar)
