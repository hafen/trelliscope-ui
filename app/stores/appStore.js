import appDispatcher from '../dispatchers/appDispatcher'
import appConstants from '../constants/appConstants'
import objectAssign from 'react/lib/Object.assign'
import cogMeta from './cogMeta'
import appConfig from '../appConfig'
var EventEmitter = require('events').EventEmitter

var CHANGE_EVENT = 'change'

var getInitialCatState = function(dat) {
  var filterOrderIndex = []
  for (var j = 0; j < dat.plotData.length; j++) {
    filterOrderIndex.push(j)
  }

  return({
    name: dat.name,
    type: dat.type,
    filter: {
      orderIndex: filterOrderIndex,
      selected: {},
      isFiltered: false,
      startIndex: 0,
      regex: '',
      // orderValue: 'ct,desc'
      orderValue: 'idx,asc'
    },
    sort: null
  })
}

var getInitialNumState = function(dat) {
  return({
    name: dat.name,
    type: dat.type,
    filter: {
      active: false,
      isFiltered: false
    },
    sort: null
  })
}

var getInitialCogState = function(dat) {
  if(dat.filterable) {
    if(dat.type === 'cat') {
      return getInitialCatState(dat)
    } else if(dat.type === 'num') {
      return getInitialNumState(dat)
    }
  }
}

var getInitialCogStates = function(cogMeta) {
  var res = {}
  for (var cur in cogMeta) {
    res[cogMeta[cur].name] = getInitialCogState(cogMeta[cur])
  }
  return res
}

var getInitialActiveFilters = function(cogMeta) {
  var res = []
  for (var cur in cogMeta) {
    if(cogMeta[cur].defActive && cogMeta[cur].type === 'cat')
      res.push(cogMeta[cur].name)
  }
  return res
}

// window.cogMeta = cogMeta
// window.cogState = getInitialCogState(cogMeta)

var _store = {
  appConfig: appConfig,
  activeSidebar: 'filter',
  cogMeta: cogMeta,
  cogState: getInitialCogStates(cogMeta),
  activeFilters: getInitialActiveFilters(cogMeta),
  filterContentHeight: 0
}

var selectNone = function(name) {
  _store.cogState[name].filter.isFiltered = false
  _store.cogState[name].filter.selected = {}
}

var handleFilterSelect = function(args) {
  if(args.data.set) {
    _store.cogState[args.name].filter.selected[args.data.id] = true
  } else {
    if(_store.cogState[args.name].filter.selected[args.data.id]) {
      delete _store.cogState[args.name].filter.selected[args.data.id]
    } else {
      _store.cogState[args.name].filter.selected[args.data.id] = true
    }
  }
  handleIsFiltered(args.name, 'cat')
}

var handleFilterRegex = function(args) {
  if(args.rgx.length > 0) {
    var rgx = new RegExp(args.rgx, 'i')
    var curId = ''

    for (var i = 0; i < _store.cogMeta[args.name].plotData.length; i++) {
      // console.log(curId)
      curId = _store.cogMeta[args.name].plotData[i].id
      if(curId.match(rgx) === null) {
        delete _store.cogState[args.name].filter.selected[curId]
      } else {
        _store.cogState[args.name].filter.selected[curId] = true
      }
    }
  } else {
    // will be triggered if user deletes text in regex field
    selectNone(args.name)
  }
  handleIsFiltered(args.name, 'cat')
}

var filterReset = function(name) {
  _store.cogState[name] = getInitialCogState(cogMeta[name])
}

var handleIsFiltered = function(name, type) {
  if(type === 'cat') {
    if(Object.keys(_store.cogState[name].filter.selected).length > 0) {
      _store.cogState[name].filter.isFiltered = true
    } else {
      _store.cogState[name].filter.isFiltered = false
    }
  }
}

var handleFilterOrder = function(args) {
  var x = args.val.split(",")

  var orderFn = d3.descending
  if(x[1] === "asc") {
    orderFn = d3.ascending
  }
  var orderIndex = []
  for (var i = 0; i < _store.cogMeta[args.name].plotData.length; i++) {
    orderIndex.push(i)
  }

  var d = _store.cogMeta[args.name].plotData
  orderIndex.sort(function(a, b) {
    return orderFn(d[a][x[0]], d[b][x[0]])
  })

  _store.cogState[args.name].filter.startIndex = 0
  _store.cogState[args.name].filter.orderValue = args.val
  _store.cogState[args.name].filter.orderIndex = orderIndex
}

var setFilterStartIndex = function(args) {
  _store.cogState[args.name].filter.startIndex = args.val
}

var setActiveSidebar = function(val) {
  if(val === _store.activeSidebar)
    val = false
  _store.activeSidebar = val
}

var toggleActiveFilter = function(name) {
  var idx = _store.activeFilters.indexOf(name)
  if(idx === -1) {
    _store.activeFilters.push(name)
  } else {
    _store.activeFilters.splice(idx, 1);
  }
}

var updateFilterHeight = function() {
  var content = document.getElementById('sidebar-content')
  var res
  if(content === null) {
    res = 0
  } else {
    res = content.clientHeight
  }
  _store.filterContentHeight = res
}

var appStore = objectAssign({}, EventEmitter.prototype, {
  addChangeListener: function(cb) {
    this.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb) {
    this.removeListener(CHANGE_EVENT, cb)
  },
  getAppConfig: function() {
    return _store.appConfig
  },
  getActiveSidebar: function() {
    return _store.activeSidebar
  },
  getCogState: function() {
    return _store.cogState
  },
  getCogMeta: function() {
    return _store.cogMeta
  },
  getActiveFilters: function() {
    return _store.activeFilters
  },
  getFilterHeight: function() {
    return _store.filterContentHeight
  }
})

appDispatcher.register(function(payload) {
  var action = payload.action
  switch(action.actionType) {
    case appConstants.ACTIVE_SIDEBAR:
      setActiveSidebar(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_SELECT_NONE:
      selectNone(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_SELECT:
      handleFilterSelect(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_REGEX:
      handleFilterRegex(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_ORDER:
      handleFilterOrder(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_START_INDEX:
      setFilterStartIndex(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_TOGGLE_ACTIVE:
      toggleActiveFilter(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_RESET:
      filterReset(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    case appConstants.F_UPDATE_HEIGHT:
      updateFilterHeight(action.data)
      appStore.emit(CHANGE_EVENT)
      break
    default:
      return true
  }
})

module.exports = appStore
