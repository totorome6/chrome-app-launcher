const ENTER = 13;
const DELETE = 46;
const GRID_MOVES = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right'
};

let appEventListeners = {
  keyup: [
      updateFocusOnArrowKeys,
      launchActiveAppOnEnterKey,
      deleteActiveAppOnDeleteKey
  ],
  mouseup: [
      launchActiveAppOnClick,
      deleteActiveAppOnRightClick
  ],
  contextmenu: [
      cancelDefaultActionForContextMenu
  ],
  focus: [
      changeActiveAppOnFocus
  ]
};

let boundEventListeners;

const { document } = window;

export function applyEventListeners(appElement, launcher) {

  if (!boundEventListeners) {
    boundEventListeners = bindEventListeners(launcher);
  }

  for (let eventName in boundEventListeners) {
    boundEventListeners[eventName].forEach((listener) => {
      appElement.addEventListener(eventName, listener);
    });
  }
}

function bindEventListeners (launcher) {
  return Object.keys(appEventListeners)
  .reduce((result, eventName) => {

    result[eventName] = appEventListeners[eventName]
    .map(listener => listener.bind(launcher));

    return result;
  },
  {});
}

function changeActiveAppOnFocus (ev) {
  this.updateActiveApp(ev.currentTarget.dataset.appId);
}

function deleteActiveAppOnRightClick (ev) {
  if (ev.which !== 3) {
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();
  this.uninstall();
}

function cancelDefaultActionForContextMenu (ev) {
  ev.preventDefault();
  ev.stopPropagation();
}

function updateFocusOnArrowKeys (ev) {
  let key = ev.keyCode,
  el = ev.currentTarget;

  if (key >= 37 && key <= 40) {
    let appId = el.dataset.appId;
    let currentIndex = this.apps.getIndexById(appId);
    let targetIndex = this.appsGrid.moveOnGrid(currentIndex, GRID_MOVES[key]);
    document.querySelectorAll('.apps-list .app')[targetIndex].focus();
  }
}

function launchActiveAppOnEnterKey (ev) {
  if (ev.keyCode === ENTER) {
    return this.launch();
  }
}

function deleteActiveAppOnDeleteKey (ev) {
  if (ev.keyCode === DELETE) {
    this.uninstall();
  }
}

function launchActiveAppOnClick (ev) {
  if (ev.which !== 1) {
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();

  this.launch();
}
