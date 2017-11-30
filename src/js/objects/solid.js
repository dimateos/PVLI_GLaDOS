'use strict';

var solid = require('./gameObject.js');

// //dos clases hijas de GO, diferentes
// function solid(graphic, position) {
//     gameObject.apply(this, [graphic, position]);
//     }
//     solid.prototype = Object.create(gameObject.prototype); //link the prototypes
//     solid.prototype.constructor = solid;                   //correct the property
//     solid.prototype.beSolid = function () {};              //specific solid behavior


function Solid (position, scale, bodySize, bodyOffSet, sprite, game) {
    //this = game.add.sprite(position.x, position.y, sprite);

    Phaser.Sprite.call(this, game, position.x, position.y, sprite);
    game.add.existing(this);
    this.scale.setTo(scale.x, scale.y);

    game.physics.arcade.enable(this);
    this.body.setSize(bodySize.x, bodySize.y, bodyOffSet.x, bodyOffSet.y);
    this.body.collideWorldBounds = true;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

module.exports = solid;
