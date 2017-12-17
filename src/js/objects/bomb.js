'use strict';

var Bombable = require('./bombable.js'); //father
var Flame = require('../id/flame.js');

var Point = require('../point.js');
var Identifiable = require('../id/identifiable.js');


//default bomb values
var bombBodySize = new Point(48, 48); //little smaller
var bombBodyOffset = new Point(0, 0);
var bombExtraOffset = new Point(5, 5); //reaquired because bomb body is not full res

var bombImmovable = true;
var bombInvecible = false;

var bombLives = 1;
var bombPower = 1;
var bombTimer = 2000;
var bombFlameTimer = 500;
var bombDieTimer = 500; // > 500

var bombSpritePath = 'bomb';
var flameId = {tier: 0, num: 0};


function Bomb (game, level, position, tileData, groups, player, bombMods) {

    var bombPosition = position.add(bombExtraOffset.x, bombExtraOffset.y);

    Bombable.call(this, game, groups, bombPosition, bombSpritePath,
        tileData.Scale, bombBodySize, bombBodyOffset, bombImmovable, bombLives, bombInvecible);

    this.timer = bombTimer;
    this.flameTimer = bombFlameTimer;
    this.power = bombPower;

    this.level = level;
    this.groups = groups;
    this.player = player; //atm not really required
    this.tileData = tileData;

    this.mods = [];
    Identifiable.applyMods(bombMods, this);

    this.xploded = false;
    //this.flamesEvent = undefined; //need to create it for die()
    this.xplosionEvent =
        game.time.events.add(this.timer, this.xplode, this);

    //console.log(bombTimer, bombFlameTimer, bombPower, level, groups, player, tileData, bombMods, this.xploded, this.xplosionEvent);
};

Bomb.prototype = Object.create(Bombable.prototype);
Bomb.prototype.constructor = Bomb;


Bomb.prototype.die = function () {
    console.log("checkin bomb die");
    this.lives--;

    //cancels the standard callbacks
    if (this.lives <= 0) {
        if (!this.xploded) {
            this.game.time.events.remove(this.xplosionEvent);
            this.xplode();
            //this.game.time.events.remove(this.flamesEvent);
        }
        //no need to destroy because xplde already destroys
    }

    else this.game.time.events.add(this.bombDieTimer, flipInven, this);
    function flipInven () { this.tmpInven = false; }
}


//removes the bomb, spawns the fames and then removes them
Bomb.prototype.xplode = function() {
    console.log("xploded");
    this.xploded = true;
    this.groups.bomb.remove(this); //removes and destroys the bomb
    this.player.numBombs++; //adds a bomb back to the player

    var flames = this.spawnFlames();

    //pushes the flames into map.flames
    for(var i = 0; i < flames.length; i++) this.groups.flame.add(flames[i]);

    //console.log(this.groups.flame.children);

    //callback to destroy the flames
    this.game.time.events.add(this.flameTimer, removeFlames, this);

    function removeFlames () {
        //.destroy() removes them from the group too
        for(var i = 0; i < flames.length; i++) flames[i].destroy();
        this.destroy();
    }
}

//spawns the first flame and calls expandFlames
Bomb.prototype.spawnFlames = function() {

    //initial flame postion (corrected offset even though then is the same)
    var cleanPosition = new Point (this.position.x, this.position.y)
        .subtract(bombExtraOffset.x, bombExtraOffset.y);

    var flames = [new Flame(this.game, cleanPosition, this.scale)];

    //get the virtual map position
    var positionMap = cleanPosition.reverseTileData(this.tileData, bombExtraOffset);

    return this.expandFlames(flames, positionMap);
}

//expands (and creates) the extra flames
Bomb.prototype.expandFlames = function(flames, positionMap) {

    //Tries to expand in each direction one by one
    var directions = [new Point(-1,0), new Point(1,0), new Point(0,-1), new Point(0,1)];
    for (var i = 0; i < directions.length; i++) {

        // var expansion = 1;
        // //these all could be the same, but allow us to know exactly waht
        // var obstacle = false, bombable = false, bomb = false, flame = false;
        // var tmpPositionMap = new Point (positionMap.x, positionMap.y);

        this.game.time.events.add(0, generateFlame, {self: this, index: i, expansion: 1});

        /*while(expansion <= this.power && !obstacle && !bombable && !bomb && !flame) {

            //checks if the next square is free
            if (this.level.getNextSquare(tmpPositionMap, directions[i])) {

                //updates tmp position
                tmpPositionMap.add(directions[i].x, directions[i].y);

                //creates the real one for the flame
                var flamePos = new Point (tmpPositionMap.x, tmpPositionMap.y)
                    .applyTileData(this.tileData);

                //creates the flame
                var newFlame = new Flame(this.game, flamePos, this.scale)
                flames.push(newFlame);
                expansion++;

                //if it touches a bombable or bomb (or a flame) it stops propagation
                bombable = this.game.physics.arcade.overlap(newFlame, this.groups.bombable);
                bomb = this.game.physics.arcade.overlap(newFlame, this.groups.bomb);
                flame = this.game.physics.arcade.overlap(newFlame, this.groups.flame);

                //we could add a timer to delay the expansions
            }
            else obstacle = true;
        }*/
    }
    console.log(flames)
    return flames; //just need to delay this somehow

    function generateFlame () {

        var self = this.self;
        var index = this.index;
        var expansion = this.expansion;

        //these all could be the same, but allow us to know exactly waht
        var obstacle = false, bombable = false, bomb = false, flame = false;
        var tmpPositionMap = new Point (positionMap.x, positionMap.y);

        //checks if the next square is free
        if (self.level.getNextSquare(tmpPositionMap, directions[index])) {

            //updates tmp position
            tmpPositionMap.add(directions[index].x, directions[index].y);

            //creates the real one for the flame
            var flamePos = new Point (tmpPositionMap.x, tmpPositionMap.y)
                .applyTileData(self.tileData);

            //creates the flame
            var newFlame = new Flame(self.game, flamePos, self.scale)
            flames.push(newFlame);
            expansion++;

            //if it touches a bombable or bomb (or a flame) it stops propagation
            bombable = self.game.physics.arcade.overlap(newFlame, self.groups.bombable);
            bomb = self.game.physics.arcade.overlap(newFlame, self.groups.bomb);
            flame = self.game.physics.arcade.overlap(newFlame, self.groups.flame);

            //we could add a timer to delay the expansions
            console.log("bombable ", bombable);
            console.log("bomb ", bomb);
            console.log("flame ", flame);

        }
        else {
            obstacle = true;
            console.log("obstacle", obstacle);
        }

        if (expansion <= self.power && !obstacle && !bombable && !bomb && !flame)
        self.game.time.events.add(100, generateFlame, this);
    }

}


module.exports = Bomb;
