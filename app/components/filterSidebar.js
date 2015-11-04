import React from 'react'
import Radium from 'radium'
import debounce from 'debounce'
import appStore from '../stores/appStore'
import appActions from '../actions/appActions'
import CatFilter from '../components/catFilter'

var renderFilterEntry = function(meta, i) {
  if(meta.type == 'cat') {
    return <CatFilter name={meta.name} key={meta.name} index={i}/>
  } else if(meta.type == 'num') {
    // return <NumFilter name={meta.name} key={meta.name}/>
    return <div key={meta.name}>not yet implemented...</div>
  } else {
    return <div key={meta.name}>not yet implemented...</div>
  }
}

var FilterSidebar = React.createClass({
  getInitialState: function() {
    return {
      cfg: appStore.getAppConfig(),
      cogState: appStore.getCogState(),
      activeFilters: appStore.getActiveFilters(),
      sidebarHeight: document.getElementById('sidebar').clientHeight
    }
  },
  componentDidMount: function() {
    appStore.addChangeListener(this._onChange)
    window.addEventListener('resize', this._handleResize)
  },
  componentWillMount: function() {
    this._handleResize = debounce(this._handleResize, 200)
  },
  componentWillUnmount: function() {
    appStore.removeChangeListener(this._onChange)
    window.removeEventListener('resize', this._handleResize)
  },
  _handleResize: function(e) {
    this.setState({
      sidebarHeight: document.getElementById('sidebar').clientHeight
    })
  },
  _onChange: function() {
    this.setState({
      cfg: appStore.getAppConfig(),
      cogState: appStore.getCogState(),
      activeFilters: appStore.getActiveFilters()
    })
  },
  render: function() {
    var styles = {
      inactiveContainer: {
        marginLeft: '4px',
        marginRight: '4px',
        marginTop: '3px'
      },
      inactiveHeader: {
        fontSize: '14px',
        marginBottom: '4px'
      }
    }

    var activeEntries = []
    var inactiveEntries = []

    // TODO: use this.state.sidebarHeight to absolutely position active filters
    var af = this.state.activeFilters
    var nActive = af.length
    for (var i = 0; i < af.length; i++) {
      activeEntries.push(renderFilterEntry(this.state.cogState[af[i]], nActive - i))
    }

    for (var i in this.state.cogState) {
      var nm = this.state.cogState[i].name
      if(af.indexOf(nm) === -1) {
        inactiveEntries.push( <InactiveFilter name={nm} key={nm}
          type={this.state.cogState[i].type}
          filtered={this.state.cogState[i].filter.isFiltered}/> )
      }
    }
    if(inactiveEntries.length > 0) {
      inactiveEntries =
      <div style={styles.inactiveContainer}>
        <div style={styles.inactiveHeader}>Inactive:</div>
        {inactiveEntries}
      </div>
    }

    var styles = {
      sidebar: {
        // width: (this.state.cfg.filter.width + 10)
      }
    }

    return (
      <div style={styles.sidebar}>
        {activeEntries}
        {inactiveEntries}
      </div>
    )
  }
})

export default Radium(FilterSidebar)

var InactiveFilter = React.createClass({
  getInitialState: function() {
    return {
      cfg: appStore.getAppConfig()
    }
  },
  _onMouseDown: function() {
    appActions.toggleActiveFilter(this.props.name)
  },
  render: function() {
    var col
    if(this.props.type === 'cat') {
      col = this.state.cfg.barColors
    } else if(this.props.type === 'num') {
      col = this.state.cfg.histColors
    }

    col = this.props.filtered ? col.select : col.default
    if(!col) {
      col = 'gray'
    }

    var styles={
      inactive: {
        background: col,
        borderRadius: 2,
        cursor: 'pointer',
        padding: '3px 8px',
        margin: 2,
        color: 'white',
        fontSize: '14px'
      }
    }

    return (
      <span type='button'
        style={styles.inactive}
        onMouseDown={this._onMouseDown}
      >{this.props.name}</span>
    )
  }
})

InactiveFilter = Radium(InactiveFilter)
