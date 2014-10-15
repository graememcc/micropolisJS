/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

define(['MiscUtils'],
       function(MiscUtils) {
  "use strict";


  // A very thin wrapper around localStorage, in case we wish to move to some other storage mechanism
  // (such as indexedDB) in the future

  var getSavedGame = function() {
    var savedGame = window.localStorage.getItem(this.KEY);

    if (savedGame !== null) {
      savedGame = JSON.parse(savedGame);

      if (savedGame.version !== this.CURRENT_VERSION)
        this.transitionOldSave(savedGame);

      // Flag as a saved game for Game/Simulation etc...
      savedGame.isSavedGame = true;
    }

    return savedGame;
  };


  var saveGame = function(gameData) {
    gameData.version = this.CURRENT_VERSION;
    gameData = JSON.stringify(gameData);

    window.localStorage.setItem(this.KEY, gameData);
  };


  var transitionOldSave = function(savedGame) {
    switch (savedGame.version) {
      case 1:
        savedGame.everClicked = false;

        /* falls through */
      case 2:
        savedGame.pollutionMaxX = Math.floor(savedGame.width / 2);
        savedGame.pollutionMaxY = Math.floor(savedGame.height / 2);
        savedGame.cityCentreX = Math.floor(savedGame.width / 2);
        savedGame.cityCentreY = Math.floor(savedGame.height / 2);

        break;

      default:
        throw new Error('Unknown save version!');
    }
  };


  var Storage = {
    getSavedGame: getSavedGame,
    saveGame: saveGame,
    transitionOldSave: transitionOldSave
  };


  Object.defineProperty(Storage, 'CURRENT_VERSION', MiscUtils.makeConstantDescriptor(3));
  Object.defineProperty(Storage, 'KEY', MiscUtils.makeConstantDescriptor('micropolisJSGame'));
  Object.defineProperty(Storage, 'canStore', MiscUtils.makeConstantDescriptor(window.localStorage !== undefined));


  return Storage;
});
