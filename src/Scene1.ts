const GRAVITY = 5;
const DT = 0.006;
const DROT = 1;

/* TODO add game state */
var paused = false;

interface KeyList {
  W: Phaser.Input.Keyboard.Key | {isDown: boolean},
  S: Phaser.Input.Keyboard.Key | {isDown: boolean},
  A: Phaser.Input.Keyboard.Key | {isDown: boolean},
  D: Phaser.Input.Keyboard.Key | {isDown: boolean},
  Q: Phaser.Input.Keyboard.Key | {isDown: boolean},
  E: Phaser.Input.Keyboard.Key | {isDown: boolean},
};

interface HelicopterMovement {
  up : number,
  forward : number,
  backward : number,
  rotate : number;
  prevTurn : boolean,
  turn : boolean,
};



interface HelicopterCommand
{
  stateY : number,
  stateX : number,
  vertStability : number,
  stateRot : number,
  forcePlaneUp : number,
};

interface Integrator
{
  state : number,
  max: number,
  min: number
};

let txt = '';

class Scene1 extends Phaser.Scene {

  movement : HelicopterMovement;
  player : Phaser.GameObjects.Sprite;
  enemy : Phaser.GameObjects.Sprite;
  command : HelicopterCommand;
  objs : Array<Phaser.GameObjects.Sprite>;

  keys : KeyList = {W: {isDown:false},
                    S: {isDown:false},
                    A: {isDown:false},
                    D: {isDown:false},
                    Q: {isDown:false},
                    E: {isDown:false}};
  pad : Phaser.Input.Gamepad.Gamepad | null = null;

  preload() {
    this.load.image('block1', 'gfx/block1.png');
    this.load.image('block2', 'gfx/block2.png');
    this.load.image('player', 'gfx/heli.png');

    this.keys.W = this.input.keyboard.addKey('W');
    this.keys.S = this.input.keyboard.addKey('S');
    this.keys.A = this.input.keyboard.addKey('A');
    this.keys.D = this.input.keyboard.addKey('D');
    this.keys.Q = this.input.keyboard.addKey('Q');
    this.keys.E = this.input.keyboard.addKey('E');
    this.command = {
      stateX : 0,
      forcePlaneUp : 0,
      stateY : 0,
      stateRot : 0,
      vertStability : 0
    };
    this.movement = {
      backward : 0,
      forward : 0,
      up : 0,
      prevTurn : false,
      turn : false,
      rotate : 0
    };
  }

  create() {
    this.player = this.add.sprite(300, 300, 'player');

    this.player.setOrigin(0.48, 0.5);
    this.player.setDepth(1);
    this.player.faceLeft = true;

    this.enemy = this.add.sprite(400, 400, 'player');
    this.enemy.setOrigin(0.3, 0.5);
    this.enemy.setDepth(1);
    this.enemy.faceLeft = true;

    this.c = this.add.circle(300,300, 3, 0x00AAAAAA);
    this.c.setDepth(2);
    this.objs = Array(30);
    for(let i = 0; i < this.objs.length; ++i)
    {
      this.objs[i] = this.add.sprite(Math.random()*600, Math.random()*600, 'block1');
    }

    this.cameras.cameras[0].startFollow(this.player);
  }

  keyToMovement(
    movement : HelicopterMovement)
  {
    movement.prevTurn = movement.turn;
    movement.up = this.keys.W.isDown ? 1.0 : 0.0;
    movement.backward = this.keys.A.isDown ? 1.0 : 0.0;
    movement.forward = this.keys.D.isDown ? 1.0 : 0.0;
    movement.turn = this.keys.S.isDown;
    if (this.keys.A.isDown && !this.keys.D.isDown && this.keys.A.shiftKey )
    {
      movement.rotate = -1.0;
    } else if (this.keys.D.isDown && !this.keys.A.isDown && this.keys.D.shiftKey )
    {
      movement.rotate = 1.0;
    }
    else
    {
      movement.rotate = 0;
    }
  }
  padToMovement(
    pad : Phaser.Input.Gamepad.Gamepad,
    movement : HelicopterMovement)
  {
    movement.prevTurn = movement.turn;
    movement.up = pad.buttons[0].value;
    movement.backward = pad.buttons[6].value;
    movement.forward = pad.buttons[7].value;
    movement.turn = pad.buttons[2].value > 0.5;
    movement.rotate = pad.axes[0].value;
  }

  processMovement(
    movement : HelicopterMovement,
    command : HelicopterCommand)
  {
    if(movement.prevTurn == false && movement.turn == true)
    {
      this.player.faceLeft = !this.player.faceLeft;
      this.player.setOrigin(1 - this.player.originX, this.player.originY);
      this.player.toggleFlipX();


    }
    let cosr = Math.cos(command.stateRot);
    let sinr = Math.sin(command.stateRot);

    let velocityX, velocityY, velocity;

    velocityY = cosr * movement.up - sinr * movement.forward + sinr * movement.backward;
    velocity = velocityY * GRAVITY - command.stateY - GRAVITY/2;
    command.stateY += velocity * DT;

    velocityX = -sinr * movement.up - cosr * movement.forward + cosr * movement.backward;
    velocity = velocityX * GRAVITY - command.stateX;
    command.stateX += velocity * DT;

    // command.stateY = GRAVITY * (2*pad.buttons[7].value - 1) - command.state;
    // command.state = command.stateY * DT;
    velocity = Math.PI * movement.rotate - command.stateRot
    command.stateRot += velocity* DT;

  }

  // getPad(pad : Phaser.Input.Gamepad.Gamepad, command : HelicopterCommand)
  // {
  //   if(pad.buttons[1].value> 0.5)
  //   {
  //     pad.buttons[1].value = 0;
  //     this.player.faceLeft = !this.player.faceLeft;
  //     this.player.setFlipX(this.player.faceLeft);
  //   }
  //     let cosr = Math.cos(command.stateRot);
  //     let sinr = Math.sin(command.stateRot);
  //     // if (pad.buttons[2].value > 0.5){
  //     //   if (command.vertStability == 0)
  //     //   {
  //     //     command.vertStability = 1;
  //     //   }
  //     //   else if (command.vertStability == 2)
  //     //   {
  //     //     command.vertStability = 3;
  //     //   }
  //     // } else {
  //     //   if (command.vertStability == 1)
  //     //   {
  //     //     command.vertStability = 2;
  //     //   }
  //     //   else if (command.vertStability == 3) {
  //     //     command.vertStability = 0;
  //     //   }
  //     // }
  //
  //     let velocityX, velocityY, velocity;
  //
  //
  //     // if (command.vertStability > 1)
  //     // {
  //     //   velocity = GRAVITY*(2*pad.buttons[7].value*up - 1) - command.stateY;
  //     // }else {
  //     //   velocity = GRAVITY*(pad.buttons[7].value*up) - command.stateY;
  //     // }
  //     // command.stateY += velocity*DT;
  //     //
  //     velocityY = cosr * pad.buttons[0].value - sinr * pad.buttons[7].value + sinr * pad.buttons[6].value;
  //     velocity = velocityY * GRAVITY - command.stateY - GRAVITY/2;
  //     command.stateY += velocity * DT;
  //
  //     velocityX = -sinr * pad.buttons[0].value - cosr * pad.buttons[7].value + cosr * pad.buttons[6].value;
  //     velocity = velocityX * GRAVITY - command.stateX;
  //     command.stateX += velocity * DT;
  //
  //
  //
  //
  //     // command.stateY = GRAVITY * (2*pad.buttons[7].value - 1) - command.state;
  //     // command.state = command.stateY * DT;
  //     velocity = Math.PI * pad.axes[0].value - command.stateRot
  //     command.stateRot += velocity* DT;
  //
  //     var buttons = '';
  //     for (var b = 0; b < pad.buttons.length; b++)
  //     {
  //       var button = pad.buttons[b];
  //       buttons = buttons.concat('B' + button.index + ': ' + button.value + '  ');
  //     }
  //     //console.log(command.stateY);
  //     // var axes = '';
  //     // for (var a = 0; a < pad.axes.length; a++)
  //     // {
  //     //   var axis = pad.axes[a];
  //     //   axes = axes.concat('A' + axis.index + ': ' + axis.getValue() + '  ');
  //     // }
  //     // console.log(axes);
  //
  // }

  test(value: Phaser.GameObjects.Sprite) : boolean
  {
    return (value.x - this.x) * (value.x - this.x) + (value.y - this.y) * (value.y - this.y) < 32;
  }
  openFile(event) {
          var input = event.target;

          var reader = new FileReader();
          reader.onload = function(){
            var text = reader.result;
            console.log(reader.result.substring(0, 200));
          };
          reader.readAsText(input.files[0]);
        };

  update() {
    if (paused)
      return;
    if(this.keys.Q.isDown)
    {
      /* Save */
      let content: string = '';
      this.objs.forEach(function (value){content += (value.x.toString() + ' ' + value.y.toString() + '\n');})
      let uriContent = "data:application/octet-stream," + encodeURIComponent(content);
      let newWindow = window.open(uriContent, 'neuesDokument');
    }
    if(this.keys.E.isDown)
    {
      /* Load */
      this.keys.E.isDown = false;
      let input = document.createElement("input");
      input.setAttribute("type", "file");
      // add onchange handler if you wish to get the file :)
      input.onchange = () => {
        /* TODO: add game pausing in game state */
        paused = true;
        const selectedFile = input.files[0];
        console.log(input.files);
        console.log(input.value);
        selectedFile.text().then((value)=>
        {
          console.log('a');
          txt = value;
          txt.split('\n').forEach(function (value, index)
          {
            let ar = value.split(' ');
            if(ar.length>1)
            {
              this[index].setX(parseFloat(ar[0]));
              this[index].setY(parseFloat(ar[1]));
            }
          }, this.objs);
          console.log(paused);
          /* TODO: add game pausing in game state */
          paused = false;
        }, ()=>{
          console.log('b');
          paused = false;
        });
        input.parentNode?.removeChild(input);

      };
      paused = true;
      setTimeout(()=>{paused = false}, 2000);
      input.onclick = ()=>{console.log('111')}
      let t = input.click();
      console.log(input.onclick);


      return;
    }
    /* check collision and reset position */
    let tmp = this.objs.some(this.test, this.player);
    if(tmp)
    {
      this.player.setX(Math.random()*600);
      this.player.setY(Math.random()*600);
    }

    if(this.pad == null && this.input.gamepad.total > 0)
    {
      this.pad = this.input.gamepad.gamepads[0];
    }

    if(this.pad != null)
    {
      this.padToMovement(this.pad, this.movement);
      //this.getPad(this.pad, this.command);
    }
    else{
      this.keyToMovement(this.movement);
    }

    this.processMovement(this.movement, this.command);

    this.player.setY( this.player.y - this.command.stateY);
    this.player.setX( this.player.x - this.command.stateX);
    this.c.x = this.player.x;
    this.c.y = this.player.y;
    this.player.setRotation( this.command.stateRot);
  }

}
