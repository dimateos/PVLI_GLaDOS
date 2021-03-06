'use strict';

//Inherits from Phaser.Sprite
function GameObject (game, position, sprite, scale) {

    Phaser.Sprite.call(this, game, position.x, position.y, sprite);

    //need to add it to the game
    game.add.existing(this);
    this.scale.setTo(scale.x, scale.y);
};

GameObject.prototype = Object.create(Phaser.Sprite.prototype);
GameObject.prototype.constructor = GameObject;

module.exports = GameObject;
