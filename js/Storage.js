define(['MiscUtils'],
       function(MiscUtils) {
  "use strict";


  // A very thin wrapper around localStorage, in case we wish to move to some other storage mechanism
  // (such as indexedDB) in the future

  var getSavedGame = function() {
    var savedGame = window.localStorage.getItem(this.KEY);

    if (savedGame) {
      savedGame = JSON.parse(savedGame);

      if (savedGame.version !== this.CURRENT_VERSION)
        this.transitionOldSave(savedGame);
    }

    // Flag as a saved game for Game/Simulation etc...
    savedGame.isSavedGame = true;

    return savedGame;
  };


  var saveGame = function(gameData) {
    gameData.version = this.CURRENT_VERSION;
    gameData = JSON.stringify(gameData);

    window.localStorage.setItem(this.KEY, gameData);
  };


  var transitionOldSave = function(savedGame) {
    throw new Error('Unknown save version!');
  };


  var Storage = {
    getSavedGame: getSavedGame,
    saveGame: saveGame,
    transitionOldSave: transitionOldSave
  };


  Object.defineProperty(Storage, 'CURRENT_VERSION', MiscUtils.makeConstantDescriptor(1));
  Object.defineProperty(Storage, 'KEY', MiscUtils.makeConstantDescriptor('micropolisJSGame'));
  Object.defineProperty(Storage, 'canStore', MiscUtils.makeConstantDescriptor(window['localStorage'] !== undefined));


  return Storage;
});
