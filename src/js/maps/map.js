'use strict';

var GameObject = require('../objects/gameObject.js');
var Physical = require('../objects/physical.js');
var Bombable = require('../objects/bombable.js');
var Enemy = require('../objects/enemy.js');

var Id = require('../id/identifiable.js').Id; //for bombable id
var tierSize = require('../id/identifiable.js').tierSize; //for the rnd gen

var Point = require('../point.js');
var baseMapData = require("./baseMapData.js"); //base map and spawns
var levelsDataBase = require("./levelsDataBase.js"); //base map and spawns

//default map tiles values
var defaultBodyOffset = new Point();
var defaultImmovable = true;
var defaultBombableLives = 1;
var defaultBombableInvencible = false;


function Map (game, worldNum, levelNum, groups, tileData, maxPlayers) {

    this.game = game;
    this.levelData = levelsDataBase[worldNum][levelNum];

    this.maxPlayers = maxPlayers;
    //this.groups = groups; //no need to extra atributes?

    //Always same base map
    this.map = baseMapData.squares;
    this.cols = baseMapData.cols;
    this.fils = baseMapData.fils;
    this.types = baseMapData.squaresTypes;
    this.playerSpawns = baseMapData.playerSpawns;

    this.idsPowerUps = this.generateIdsPowerUps();

    this.generateMap();
    this.buildMap(groups, tileData);
};


//Adds all the extra bombables and walls
Map.prototype.generateMap = function() {
    var self = this; //instead of apply
    var freeSquares = this.getFreeSquares(this.maxPlayers);

    //first generates the ones with the drops
    var numDrops = this.idsPowerUps.length;
    insertRnd(numDrops, this.types.bombableDrop.value);

    insertRnd(this.levelData.bombables-numDrops, this.types.bombable.value);
    insertRnd(this.levelData.extraWalls, this.types.wall.value);
    insertRnd(this.levelData.enemies[0], this.types.enemy.value);

    function insertRnd (numElem, type) {
        for (var i = 0; i < numElem; i++) {
            //between and including min and max (Phaser)
            var rnd = self.game.rnd.integerInRange(0,freeSquares.length-1)
            var x = freeSquares[rnd].x;
            var y = freeSquares[rnd].y;

            self.map[y][x] = type;

            //special odd wall placement to avoid wrong generation
            if (type === 1 && x%2 != 0 && y%2 != 0)
                self.removeSurroundingSquares(x,y,2,freeSquares)
            else freeSquares.splice(rnd,1); //removes from list
        }
    }
};

//gets the free squares of map excluding player pos
Map.prototype.getFreeSquares = function(maxPlayers) {
    var freeSquares = [];

    for (var i = 0; i < this.fils; i++)
        for (var j = 0; j < this.cols; j++)
            if (this.map[i][j] == 0 /*&& !checkPlayerSquare(j,i,maxPlayers)*/)
                freeSquares.push({x: j, y: i});

    //now we search and remove the players spawns and surroundings
    for (var numPlayer = 0; numPlayer < maxPlayers; numPlayer++)
        this.removeSurroundingSquares(
            this.playerSpawns[numPlayer].x, this.playerSpawns[numPlayer].y, 1, freeSquares);

    return freeSquares;

    //to compare directly instead of searching after (was my first aproach)
    //the newer implementation searches and removes, so worse case => as complex as this
    //the newer is better too because is a shared method (used in map generation)
    /*function checkPlayerSquare (x,y,maxPlayers) {
        for (var numPlayer = 0; numPlayer < maxPlayers; numPlayer++)
            if ((x == map.playerSpawns[numPlayer].x && y == map.playerSpawns[numPlayer].y)
            || (x == map.playerSpawns[numPlayer].x-1 && y == map.playerSpawns[numPlayer].y)
            || (x == map.playerSpawns[numPlayer].x+1 && y == map.playerSpawns[numPlayer].y)
            || (x == map.playerSpawns[numPlayer].x && y == map.playerSpawns[numPlayer].y-1)
            || (x == map.playerSpawns[numPlayer].x && y == map.playerSpawns[numPlayer].y+1))
                return true;
    }*/
};

//generates the array of random powerUps based on levelsDataBase info
Map.prototype.generateIdsPowerUps = function () {

    var powerUps = this.levelData.powerUps;
    var Ids = [];

    for (var tier = 0; tier < powerUps.length; tier++) {
        for (var n = 0; n < powerUps[tier]; n++) {
            //between and including min and max (Phaser)
            var rnd = this.game.rnd.integerInRange(0, tierSize(tier)-1);
            Ids.push(new Id(tier, rnd));
        }
    }
    //for (var i = 0; i < Ids.length; i++) console.log(Ids[i]);

    return Ids;
};

//given a free square {x: x, y: y} in a freeSquares[] and a radius
//searches and removes (real map) surroundings squares of that radius
//removes the given square too? atm yes
Map.prototype.removeSurroundingSquares = function(x, y, radius, freeSquares) {

    //Will be used with findIndex *(not supported in IE)*
    function equal (e) {
        return e.x === x_toFind
            && e.y === y_toFind;
    };

    var index; //search and store index
    var x_toFind = x, y_toFind = y; //tmp

    //first search: given square
    index = freeSquares.findIndex(equal);
    if (index > -1) freeSquares.splice(index, 1);

    //second and third searches: horizontal
    x_toFind = x - radius;
    index = freeSquares.findIndex(equal);
    if (index > -1) freeSquares.splice(index, 1);

    x_toFind = x + radius;
    index = freeSquares.findIndex(equal);
    if (index > -1) freeSquares.splice(index, 1);

    //last two: vertical (reset x required)
    x_toFind = x; y_toFind = y - radius;
    index = freeSquares.findIndex(equal);
    if (index > -1) freeSquares.splice(index, 1);

    y_toFind = y + radius;
    index = freeSquares.findIndex(equal);
    if (index > -1) freeSquares.splice(index, 1);
};

//creates all elements in their respective positions etc
Map.prototype.buildMap = function (groups, tileData) {

    for (var i = 0; i < this.cols; i++) {
        for (var j = 0; j < this.fils; j++) {

            //new point each time is bad? auto deletes trash?
            var squareIndexPos = new Point(i,j).applyTileData(tileData);
            var idPowerUp;

            switch(this.map[j][i]) {

                case this.types.bombableDrop.value:
                    idPowerUp = this.idsPowerUps.pop(); //gets an Id

                case this.types.bombable.value:
                    groups.bombable.add(new Bombable (this.game, groups, squareIndexPos,
                        this.types.bombable.sprite, tileData.Scale, tileData.Res,
                        defaultBodyOffset, defaultImmovable,
                        defaultBombableLives, defaultBombableInvencible, idPowerUp));

                    idPowerUp = undefined; //resets it

                    //no break so there is background underneath
                case this.types.free.value:
                    groups.background.add(new GameObject (this.game, squareIndexPos,
                        this.types.free.sprite, tileData.Scale));

                    break;

                case this.types.enemy.value: //TODO: not finished

                    //adds floor too
                    groups.background.add(new GameObject (this.game, squareIndexPos,
                        this.types.free.sprite, tileData.Scale));

                    groups.enemy.add(new Enemy (this.game, squareIndexPos,
                        this, 0, tileData, groups));

                    break;

                case this.types.wallSP.value: //no special tile atm
                case this.types.wall.value:
                    groups.wall.add(new Physical (this.game, squareIndexPos,
                        this.types.wall.sprite, tileData.Scale, tileData.Res,
                        defaultBodyOffset, defaultImmovable));

                    break;
            }
        }
    }
};


//given a square position returns true if in given direction there is not a wall
//return if there was a bombable too
Map.prototype.getNextSquare = function (position, direction, /*bombable*/) {

    var x = position.x + direction.x;
    var y = position.y + direction.y;

    //not used atm, to use needs bombable to update map in die();
    //bombable = (this.map[y][x] === this.types.bombable.value);

    return (this.map[y][x] !== this.types.wallSP.value
        && this.map[y][x] !== this.types.wall.value);
}


module.exports = Map;
