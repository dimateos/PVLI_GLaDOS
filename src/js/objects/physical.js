'use strict';

var GameObject = require('./gameObject.js');

//Inherits from GameObject
function Physical(game, position, sprite, scale, bodySize, bodyOffSet, immovable) {

    GameObject.call(this, game, position, sprite, scale);

    game.physics.arcade.enable(this);
    this.body.setSize(bodySize.x, bodySize.y, bodyOffSet.x, bodyOffSet.y);
    this.body.collideWorldBounds = true;

    this.body.immovable = immovable; //if static then immovable
}

Physical.prototype = Object.create(GameObject.prototype);
Physical.prototype.constructor = Physical;

module.exports = Physical;
