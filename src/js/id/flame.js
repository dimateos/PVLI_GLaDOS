'use strict';

var Physical = require('../objects/physical.js');
var Point = require('../point.js');

//default flameentifiable values
var flameBodySize = new Point(48, 48); //little smaller
var flameBodyOffset = new Point(0, 0);
var flameExtraOffset = new Point(5, 5); //flame body is not full res
var flameImmovable = true;
var flameSprite = 'flame';

function Flame (game, position, scale) {

    var flamePosition = position.add(flameExtraOffset.x, flameExtraOffset.y);

    Physical.call(this, game, position, flameSprite, scale,
        flameBodySize, flameBodyOffset, flameImmovable);

}

Flame.prototype = Object.create(Physical.prototype);
Flame.prototype.constructor = Flame;

module.exports = Flame;