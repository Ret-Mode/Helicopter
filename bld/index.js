"use strict";
let config = {
    width: 1000,
    height: 700,
    backgroundColor: 0x300000,
    scene: [Scene1],
    input: {
        gamepad: true
    },
    physics: {
        default: "arcade",
        arcade: { debug: false }
    }
};
var game = new Phaser.Game(config);
//# sourceMappingURL=index.js.map