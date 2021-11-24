//sizes 3840 2160 / 1920 / 10800
const FPS = 30; // Frames per seconden.
const FRICTION = 0.7; // frictie in de ruimte waar (0 = geen frictie, 1 = frictie)
const GAME_LIVES = 3; // Jouw levens
const ROID_NUM = 1; // Begin aantal astroiden.
const LASER_DIST = 0.5; // Maximale afstand een lazer kan maken.
const LASER_MAX = 10; // Aantal lazers op het scherm.
const LASER_SPD = 500; // Snelheid van lazer in pixels per seconden
const LASER_EXPLODE_DUR = 0.1; // Hoe lang een explotie duurt van de lazers in pixel per seconden.
const ROIDS_PTS_LGE = 20; // punten voor groote astroiden.
const ROIDS_PTS_MED = 50; // punten voor middle groote astroiden.
const ROIDS_PTS_SML = 100; // punten voor kleine astroiden.
const ROIDS_JAG = 0.4; // Jaggedness van de astroiden. (0 = none, 1 = lots)
const ROIDS_SPD = 75; // maximum begin snelheid voor de astroiden in px.
const ROIDS_SIZE = 100; // Begin groote van astroiden in px.
const ROIDS_VERT = 10; // Aantal vertices op iedere astroide.
const SAVE_KEY_SCORE = "hightscore"; // Lokale storage voor score.
const SHIP_EXPLODE_DUR = 0.5; // Hoe lang de explotie duurt van het schip.
const SHIP_INV_DUR = 3; // Hoe lang het schip onverwoestbaar is.
const SHIP_BLINK_DUR = 0.1; // Hoe lang het schip knippert so lang het onverwoestbaar is in seconden.
const SHIP_SIZE = 30; // Groote van het schip in pixels.
const SHIP_SHRUST = 5; // Snelheid van het schip in pixel per seconden.
const TURN_SPEED = 360; // Draai snelheid in graden per seconden.
const SHOW_BOUNDING = false; // Laat zien of verbergt de collision bounding.
const TEXT_FADE_TIME = 2.5 // Hoe lang de text er zal blijven voordat het fade.
const TEXT_SIZE = 100; // Groote van text in px.

//Om te laten zien dat het een canvas element is.
/** @type {HTMLCanvasElement} */
//Het canvas word aan een variable aangesloten.
var canv = document.getElementById("Space");
//De context van de canvas.
var ctx = canv.getContext("2d");

// Opzetten game parameter.
var level, lives, roids, ship, score, scoreHigh, text, textAlpha;
newGame();

// Opzetten van event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Opzetten van de game loop.
setInterval(update, 1000 / FPS)


function createAsteroidBelt() {
    roids = [];
    var x, y;
    for (var i = 0; i < ROID_NUM + level; i++){
        do {
            x = Math.floor (Math.random() * canv.width);
            y = Math.floor (Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function destroyAsteroid(index){
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    // Splitten van de astroiden
    if (r == Math.ceil(ROIDS_SIZE / 2)){
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        score += ROIDS_PTS_LGE;
    } else if (r == Math.ceil(ROIDS_SIZE / 4)){
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        score += ROIDS_PTS_MED;
    }	else {
        score += ROIDS_PTS_SML;
    }

    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    // Vernietig astroide
    roids.splice(index, 1);

    // Als het level geen astroiden meer heeft.
    if(roids.length == 0){
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a){
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;

    ctx.beginPath();
    ctx.moveTo( // Voorkant van het schip.
     x + 4 / 3 * ship.r * Math.cos(a),
     y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo ( // Links achterkant van het schip.
     x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
     y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );

    ctx.lineTo ( // Rechts achterkant van het schip.
     x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
    y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    // Maakt het schip af.
    ctx.closePath();
    //Tekent het schip.
    ctx.stroke();
}

function explodeShip(){
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function keyDown(/** @type {KeyboardEvent} */ ev) {

    if(ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // Spatie (Schiet een lazer)
            shootLaser();
        break;
        case 37: // Linker pijl (schip draait naar links)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
        break;
        case 38: // Boven pijl (schip gaat naar voren)
            ship.thrusting = true;
        break;
        case 39: // Rechter pijl (schip draait naar Rechst)
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
        break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev){

    if(ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // Spatie (Je mag weer schieten met de lazer)
            ship.canShoot = true;
        break;
        case 37: // Linker pijl (Stoppen met naar links draaien)
            ship.rot = 0;
        break;
        case 38: // Boven pijl (Het schip stoppen)
            ship.thrusting = false;
        break;
        case 39: // Rechter pijl (Stoppen met naar rechst draaien)
            ship.rot = 0;
        break;
    }
}

function newAsteroid(x, y, r) {
    var lvlMult = 1 + 0.1 * level;
    // De locatie waar de astroiden zullen zijn.
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2, // In radians
        // De groote van de astroiden.
        r: r,
        offs: [],
        vert: Math.floor (Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2)
    };

    // Maken van de vertex offets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();
    newLevel();

    //Pakt de highscore vanuit de local storage
    var scoreStr = scoreHigh = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }

}

function newLevel(){
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        // x positie van het schip.
        x: canv.width / 2,
        // y positie van het schip.
        y: canv.height / 2,
        // De groote van het schip.
        r: SHIP_SIZE / 2,
        // Convert to radians (Waar het schip naar toekijkt)
        a: 90 / 180 * Math.PI,
        // Het aantal keer dat het schip zal knipperen mett de invinsability.
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),

        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),

        canShoot: true,

        dead: false,

        explodeTime: 0,
        lasers: [],
        // Rotatie van het schip
        rot: 0,
        // Beweging van het schip
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser(){
        // Maken van lazer object.
        if(ship.canShoot && ship.lasers.length < LASER_MAX){
            ship.lasers.push({ // Schieten vanaf het voorpunt van het schip.
                x:	ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                y:	ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                xv:	LASER_SPD * Math.cos(ship.a) / FPS,
                yv:	-LASER_SPD * Math.sin(ship.a) / FPS,
                dist: 0,
                explodeTime: 0
            });
        }
        // Voorkomen van verschieten.
        ship.canshoot = false;
}

function update() {

    var blinkOn = ship.blinkNum % 2 == 0;

    var exploding = ship.explodeTime > 0;

     // Maken van de achtergrond.
     // Maakt de achtergrond zwart.
     ctx.fillStyle = "black";
     //Creeert het speelveld in de browser pagina.
     ctx.fillRect(0, 0, canv.width, canv.height);

     //Beweging van het schip.
     if(ship.thrusting && !ship.dead){
         ship.thrust.x += SHIP_SHRUST * Math.cos(ship.a) / FPS;
         ship.thrust.y -= SHIP_SHRUST * Math.sin(ship.a) / FPS;

         // Tekenen van de motor.
         if (!exploding && blinkOn) {
             ctx.fillStyle = "red";
             ctx.strokeStyle = "yellow",
             ctx.lineWidth = SHIP_SIZE / 10;

             ctx.beginPath();
             ctx.moveTo( // Links achterkant
                 ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                 ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
             );
             ctx.lineTo ( // Achterkant van het schip
                 ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                 ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
             );

             ctx.lineTo ( // Rechts achterkant
                 ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 *  Math.sin(ship.a)),
                 ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
             );
             // Maakt de motor af.
             ctx.closePath();

             ctx.fill();
             // Tekent de motor.
             ctx.stroke();
         }
     } else {
         ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
         ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
     }

     // Maken van het schip.
     if(!exploding) {

                 if (blinkOn && !ship.dead) {
                     drawShip(ship.x, ship.y, ship.a);
             }
             // Handelen knipperen.
             if (ship.blinkNum > 0){
                 // Knipper tijd verminderen.
                 ship.blinkTime--;
                 // Knipper aantal verminderen.
                 if (ship.blinkTime == 0) {
                     ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                     ship.blinkNum--;
                 }
            }
     } else {
        // tekenen van explotie.
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // Laat de collider zien.
    if (SHOW_BOUNDING){
         ctx.strokeStyle = "Lime";
         ctx.beginPath();
         ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
     }

     // Tekenen van lasers.
    for (var i = 0; i < ship.lasers.length; i++){
        if(ship.lasers[i].explodeTime == 0){
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // Tekenen van explotie.
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // Tekenen van level tekst.
    if (textAlpha >= 0){
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps 50px sans-serif";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead){
        newGame();
    }

    // tekenen levens
    for (var i = 0; i < lives; i++){
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI);
    }

    // Tekenen score
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = "small-caps 25px sans-serif";
    ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

    // Tekenen highscore
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = "small-caps 20px sans-serif";
    ctx.fillText("Highscore: " + scoreHigh, canv.width / 2, SHIP_SIZE);

    // Detecteren of een lazer een astroide raakt.
    var ax, ay, ar, lx, ly;
    for (var i = roids.length - 1; i >= 0; i--){
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;


    for (var j = ship.lasers.length - 1; j >= 0; j--){
        lx = ship.lasers[j].x;
        ly = ship.lasers[j].y;

        //Wanneer het direct raak is.
        if(ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar){

            // Vernietigt de astroide.
            destroyAsteroid(i);
            ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
            break;
        }
    }
}

     // Maken van de astroiden
     var x, y, r, a, vert, offs;
     for (var i = 0; i < roids.length; i++) {

         ctx.strokeStyle = "slategrey";
         ctx.lineWidth = SHIP_SIZE / 20;

         // Properties van de astroiden.
         x = roids[i].x;
         y = roids[i].y;
         r = roids[i].r;
         a = roids[i].a;
         vert = roids[i].vert;
         offs = roids[i].offs;

         // Een pad tekenen.
         ctx.beginPath();
         ctx.moveTo(
             x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a),
         );

         // Maken vorm astroiden.
         for (var j = 1; j < vert; j++) {
             ctx.lineTo (
                 x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),
             );
         }

         ctx.closePath();
         ctx.stroke();

         if (SHOW_BOUNDING){
             ctx.strokeStyle = "Lime";
             ctx.beginPath();
             ctx.arc(x, y, r, 0, Math.PI * 2, false);
             ctx.stroke();
         }
     }
     // Het draaien van het schip.
     ship.a += ship.rot;

     //checken voor astroide botsingen.
     if (!exploding) {
         if (ship.blinkNum == 0 && !ship.dead) {
             for (var i = 0; i < roids.length; i++){
                    if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
                        explodeShip();
                        destroyAsteroid(i);
                        break;
                    }
                }
            }

         // Het bewegen van het schip.
         ship.x += ship.thrust.x;
         ship.y += ship.thrust.y;
    }	else {
        console.log(ship.explodeTime)
        ship.explodeTime--;

        if (ship.explodeTime == 0){
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

     // Grens van scherm
     if (ship.x < 0 - ship.r) {
         ship.x = canv.width + ship.r;
      } else if (ship.x > canv.width + ship.r) {
         ship.x = 0 - ship.r;
      }

    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }

        for (var i = ship.lasers.length - 1; i >= 0; i--) {
            // Checken hoe ver de lazer is gekomen.
            if (ship.lasers[i].dist > LASER_DIST * canv.width){
                ship.lasers.splice(i, 1);
                continue;
            }

            // Lazer explotie
            if(ship.lasers[i].explodeTime > 0){
                ship.lasers[i].explodeTime--;
                // Lazer vernietigen als de explotie is afgelopen.
                if(ship.lasers[i].explodeTime == 0){
                    ship.lasers.splice(i, 1);
                    continue;
                }
            } else {
                // Beweging van de lazers.
                ship.lasers[i].x += ship.lasers[i].xv;
                ship.lasers[i].y += ship.lasers[i].yv;

                // Uitreken hoe ver een lazer is gekomen.
                ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }
            // Als een lazer bij de rand komt.
            if (ship.lasers[i].x < 0) {
                    ship.lasers[i].x = canv.width;
            }	else if (ship.lasers[i].x > canv.width){
                ship.lasers[i].x = 0;
            }
            if (ship.lasers[i].y < 0) {
                    ship.lasers[i].y = canv.height;
            }	else if (ship.lasers[i].y > canv.height){
                ship.lasers[i].y = 0;
            }
        }

    for(var i = 0; i < roids.length; i++){
    // Beweging astroiden.
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;


    // Als een astroide bij de rand komt.
        if (roids[i].x < 0 - roids[i].r){
            roids[i].x = canv.width + roids[i].r;
        } else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r){
        roids[i].y = canv.height + roids[i].r;
        } else if (roids[i].y > canv.height + roids[i].r){
        roids[i].y = 0 - roids[i].r
        }

         // Center punt.
         ctx.fillStyle = "red";
         ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
     }
 }