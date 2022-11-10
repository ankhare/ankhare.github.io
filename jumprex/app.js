'use strict';
$(document).ready(function () {
    const grid = $('.grid');
    const rex = $(document.createElement('div'));
    let rexLeftSpace;
    let jumpStart = 10;
    let rexBottomSpace;
    let isGameOver = false;
    let platCount = 10;
    let platforms = [];
    let jumpHeight = 25;
    let upTimerId;
    let downTimerId;
    let leftTimerId;
    let rightTimerId;
    let movePlatformId;
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;
    let score = 0;
    let startPlat;
    let currentPlat;
    let platformsMoving = false

    function createRex(){
        rex.addClass('rex');
        grid.append(rex);
        startPlat = platforms[0];
        rexBottomSpace = platforms[0].bottom + 2
        rexLeftSpace = platforms[0].left;
        rex.css('left', platforms[0].left + 'vw');
        rex.css('bottom', platforms[0].bottom + 2 + 'vw'); // account for platform height
    }

    class Platform{
        constructor(newPlatBottom){
            this.bottom = newPlatBottom;
            this.left = Math.random() * 48; // screen width - plat width
            this.visual = $(document.createElement('div'));
            const visual = this.visual;

            visual.addClass('platform');
            visual.css('left', this.left + 'vw');
            visual.css('bottom', this.bottom + 'vw');
            grid.append(visual);
        }

        get latest() {
            return this.bottom;
        }
    }

    function createPlatforms(){
        for(let i=0; i < platCount; i++){
            let gridHeight = grid.height();
            let platGap = 85 / platCount; // grid height
            let newPlatBottom = 10 + i * platGap;
            let newPlaform = new Platform(newPlatBottom);
            platforms.push(newPlaform);
        }
    }

    function movePlatforms(){
        if(rexBottomSpace > 2){
            platforms.forEach(platform => {
                platform.bottom -= 1.4;
                let visual = platform.visual;
                visual.css('bottom', platform.bottom + 'vw');
                score++;
                $('#score').html(`${score/10}`);

                if (platform.bottom < 0 - 2){ //platform height
                    let firstPlatform = platforms[0].visual;
                    firstPlatform.removeClass('platform');
                    platforms.shift();
                    // console.log(platforms);
                    let newPlaform = new Platform(90); // at top of grid
                    platforms.push(newPlaform);
                }
            })
        }
    }

    function gameOver(){
        // console.log('gameOver')
        isGameOver = true;
        rex.addClass('blink')
        setTimeout(()=>{
            grid.empty();
            grid.html(`<div class="result">Score: ${score/10}</div>`)
        }, 1000)
        
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId); 
        $('#l').prop('disabled', true);
        $('#u').prop('disabled', true);
        $('#r').prop('disabled', true);
    }

    function fall(){
        // console.log('falling')
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(function(){
            rexBottomSpace -= 1;
            rex.css('bottom', rexBottomSpace + 'vw');
            if (rexBottomSpace <= 0){
                gameOver();
            }

        platforms.forEach((platform, i)  => {
            if ( !isJumping && (rexBottomSpace >= platform.bottom) //if above platform
            && (rexBottomSpace <= platform.bottom + 2) //2 represents height of each platform
            && (rexLeftSpace + 8 >= platform.left) // 8 rex width
            && (rexLeftSpace <= platform.left + 11)) //12 represents width of each platform
            {
                // console.log('jump');
                // jumpStart = rexBottomSpace;
                currentPlat = platforms[i];
                jump(startPlat, currentPlat);
                if(startPlat != currentPlat ){
                    // clearInterval(movePlatformId);
                    if (!platformsMoving && rexBottomSpace >= 45){
                        platformsMoving = true;
                        const target = startPlat.latest;
                        // console.log(target + "target")
                        movePlatformId = setInterval(() => {
                            movePlatforms();
                            if (currentPlat.bottom <= target){
                                // console.log(currentPlat.bottom + "stopped")
                                clearInterval(movePlatformId);
                                platformsMoving = false;
                            }
                        }, 30);
                    }
                    else if(!platformsMoving){
                       let counter = 4;
                        movePlatformId = setInterval(() => {
                            movePlatforms();
                            if (counter == 0){
                                clearInterval(movePlatformId);
                                platformsMoving = false;
                            }
                            counter --
                        }, 30);
                    }
                }
                startPlat = currentPlat;
            }
        })
        }, 30)
    }
    function jump(startPlat, currentPlat){
        // console.log('jumping')
        isJumping = true;
        clearInterval(downTimerId);
        const jumpStart =  startPlat.latest;
        // const jumpStop = startPlat.latest;
        upTimerId = setInterval(function(){
            rexBottomSpace += .6;
            rex.css('bottom', rexBottomSpace + 'vw');

            if (rexBottomSpace  + 8 > jumpHeight + jumpStart){
                fall();
            }
        }, 30 ) 

        // const target = startPlat.latest;
        // if (startPlat != currentPlat){
        //     movePlatformId = setInterval(() => {
        //         movePlatforms();
        //         if (stop.bottom >= target){
        //         clearInterval(movePlatformId);
        //         }
        //     }, 30);
        // }else{
        //     clearInterval(movePlatformId) 
        // }
    }

    function moveLeft(){
        if (isGoingRight){
            // clearInterval(rightTimerId);
            isGoingRight = false;
        }
        // if (isGoingLeft){
        //     return;
        // }
        isGoingLeft = true;
        if (rexLeftSpace >= 0){
                rex.css('background-image','url("left-rex.png")');
                rexLeftSpace -= .6;
                rex.css('left', rexLeftSpace + 'vw');
        } else{
            rex.css('left', 60 - 8 + 'vw'); // 8 is width of rex
            rexLeftSpace = 60 - 8;
        }

        // leftTimerId = setInterval(function(){
        //     if (rexLeftSpace >= 0){
        //         rexLeftSpace -= .4;
        //         rex.css('left', rexLeftSpace + 'vw');
        //     } else {
        //         clearInterval(leftTimerId);
        //         isGoingLeft = false;
        //     }
        // },30)
    }

    function moveRight(){
        if (isGoingLeft){
            // clearInterval(leftTimerId);
            isGoingLeft = false;
        }

        // if (isGoingRight){
        //     return;
        // }

        isGoingRight = true;
        if (rexLeftSpace <= 60 - 8){ //acount for width of rex
                rex.css('background-image','url("right-rex.png")');
                rexLeftSpace += .6;
                rex.css('left', rexLeftSpace + 'vw');
        } else{
                rex.css('left', 0 + 'vw');
                rexLeftSpace = 0;
        }
        // rightTimerId = setInterval(function(){
        //     if (rexLeftSpace <= 60 - 8){ //acount for width of rex
        //         rexLeftSpace += .4;
        //         rex.css('left', rexLeftSpace + 'vw');
        //     } else{
        //         clearInterval(rightTimerId)
        //         isGoingRight = false;
        //     }
        // },30)
    }

    // function moveStraight(){
    //     isGoingLeft = false;
    //     isGoingRight = false;
    //     // clearInterval(leftTimerId)
    //     // clearInterval(rightTimerId);
    // }


    function control(e){
        if (e.key === "ArrowLeft"){
            moveLeft();
        } else if(e.key === "ArrowRight"){
            moveRight();
        }
        //else if (e.key === "ArrowUp"){
        //     moveStraight();
        // }
    }

    function start(){
        if (!isGameOver){
            createPlatforms();
            createRex();
            // setInterval(movePlatforms, 30);
            jump(platforms[0], platforms[0]); 
        }

        document.addEventListener('keydown', control);

        $('#l').on('touchstart mousedown', function(e) {
            e.preventDefault();
            clearInterval(rightTimerId);
            leftTimerId = setInterval(function () {
                moveLeft();
            }, 20);
        });

        $('#l').on('touchend mouseup', function(e) {
            e.preventDefault();
            clearInterval(leftTimerId);
         });

        // $('#u').click(function(){
        //     moveStraight();
        // });

        $('#r').on('touchstart mousedown', function(e) {
            e.preventDefault();
            clearInterval(leftTimerId);
            rightTimerId = setInterval(function () {
                moveRight();
            }, 20);
        });

        $('#r').on('touchend mouseup', function(e) {
            e.preventDefault();
            clearInterval(rightTimerId);
         });
    }
    //attach to button
    start();
    
})
    

