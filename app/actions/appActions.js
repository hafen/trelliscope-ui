import appDispatcher from '../dispatchers/appDispatcher'
import appConstants from '../constants/appConstants'

var appActions = {
  setActiveSidebar: function(val) {
    appDispatcher.handleAction({
      actionType: appConstants.ACTIVE_SIDEBAR,
      data: val
    })
  },
  selectNone: function(name) {
    appDispatcher.handleAction({
      actionType: appConstants.F_SELECT_NONE,
      data: name
    })
  },
  handleFilterSelect: function(args) {
    appDispatcher.handleAction({
      actionType: appConstants.F_SELECT,
      data: args
    })
  },
  handleFilterRegex: function(args) {
    appDispatcher.handleAction({
      actionType: appConstants.F_REGEX,
      data: args
    })
  },
  handleFilterOrder: function(args) {
    appDispatcher.handleAction({
      actionType: appConstants.F_ORDER,
      data: args
    })
  },
  setFilterStartIndex: function(args) {
    appDispatcher.handleAction({
      actionType: appConstants.F_START_INDEX,
      data: args
    })
  },
  toggleActiveFilter: function(name) {
    appDispatcher.handleAction({
      actionType: appConstants.F_TOGGLE_ACTIVE,
      data: name
    })
  },
  filterReset: function(name) {
    appDispatcher.handleAction({
      actionType: appConstants.F_RESET,
      data: name
    })
  },
  updateFilterHeight: function() {
    appDispatcher.handleAction({
      actionType: appConstants.F_UPDATE_HEIGHT
    })
  }
}

module.exports = appActions
