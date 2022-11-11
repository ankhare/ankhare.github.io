'use strict';
$(document).ready(function () {
    //enable bootstrap popover
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
    
    $(function() {
        $("[data-toggle=popover]").popover({
            html: true,
            content: function() {
            var content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
            }
        });
    });

    const grid = $('.grid');
    const rex = $(document.createElement('div'));
    let rexLeftSpace;
    let rexBottomSpace;
    let isGameOver = false;
    let platCount = 10;
    let platforms = [];
    let jumpHeight = (85 / platCount) * 3;
    // let jumpHeight = 25;
    let upTimerId;
    let downTimerId;
    let leftTimerId;
    let rightTimerId;
    let movePlatformId;
    let isJumping = true;
    let score = 0;
    let startPlat;
    let currentPlat;
    let platformsMoving = false
    let lmousedown = false;
    let rmousedown = false;

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
            this.left = Math.random() * 68; // screen width - plat width
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

    function fall(){
        // console.log('falling')
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(function(){
            rexBottomSpace -= 1;
            rex.css('bottom', rexBottomSpace + 'vw');
            if (rexBottomSpace < 0){
                gameOver();
            }

        platforms.forEach((platform, i)  => {
            if ( !isJumping && (rexBottomSpace >= platform.bottom) //if above platform
            && (rexBottomSpace <= platform.bottom + 2) //2 represents height of each platform
            && (rexLeftSpace + 7 >= platform.left) // 8 rex width
            && (rexLeftSpace <= platform.left + 16)) //12 represents width of each platform
            {
                // console.log('jump');
                currentPlat = platforms[i];
                jump(startPlat, currentPlat);
                if(startPlat != currentPlat ){
                    // clearInterval(movePlatformId);
                    if (!platformsMoving && rexBottomSpace >= 35){
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
                        }, 20);
                    }
                }
                startPlat = currentPlat;
            }
        })
        }, 20)
    }

    function jump(startPlat, currentPlat){
        isJumping = true;
        clearInterval(downTimerId);
        let jumpStart = startPlat.bottom;
        // if (startPlat.bottom > currentPlat.bottom){
        //     jumpStart =  currentPlat.bottom;
        // } else {
        //     jumpStart =  startPlat.bottom;
        // }
        // else{
        //     jumpStart =  currentPlat.bottom;
        //     console.log('falling at stop plat\'s height');
        // }
        
        upTimerId = setInterval(function(){
            rexBottomSpace += .6;
            rex.css('bottom', rexBottomSpace + 'vw');
            if (rexBottomSpace  + 8 > jumpHeight + jumpStart){
                fall();
            }
        }, 20 ) 
    }

    function moveLeft(){
        if (rexLeftSpace >= 0){
                rexLeftSpace -= .6;
                rex.css('left', rexLeftSpace + 'vw');
        } else{
            rex.css('left', 80 - 8 + 'vw'); // 8 is width of rex
            rexLeftSpace = 80 - 8;
        }
    }

    function moveRight(){
        if (rexLeftSpace <= 80 - 8){ //acount for width of rex
                rexLeftSpace += .6;
                rex.css('left', rexLeftSpace + 'vw');
        } else{
                rex.css('left', 0 + 'vw');
                rexLeftSpace = 0;
        }
    }

    function gameOver(){
        // console.log('gameOver')
        isGameOver = true;
        rex.addClass('blink')
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId); 
        clearInterval(movePlatformId);
        platformsMoving = false
        lmousedown = false;
        rmousedown = false;

        $('#l').prop('disabled', true);
        $('#r').prop('disabled', true);

        platforms = [];
        setTimeout(()=>{
            grid.empty();
            grid.html(`<div class="result">Score: ${score/10} </div>
            <div class="container-fluid">
            <button type="button" id="restart" class="key">restart</button>`);
            $('#restart').click(()=>{
                location.reload()
            })
        }, 1000)
    }

    function start(){
        if (!isGameOver){
            createPlatforms();
            createRex();
            jump(platforms[0], platforms[0]); 
            $('#l').prop('disabled', false);
            $('#r').prop('disabled', false);

            document.addEventListener('keydown', (e)  => {
                if (e.key === 'ArrowLeft'){
                    if (!lmousedown){
                        $('#l').mousedown();
                    }
                } else if(e.key === 'ArrowRight'){
                    if(!rmousedown){
                        $('#r').mousedown();
                    }
                } 
            })
    
            document.addEventListener('keyup', (e)  => {
                if (e.key=== 'ArrowLeft'){
                    $('#l').mouseup();
                } else if(e.key === 'ArrowRight'){
                    $('#r').mouseup();
                } 
            })
            $('#l').on('touchstart mousedown', function leftStart(e) {
                e.preventDefault();
                lmousedown = true;
                rex.css('background-image','url("left-rex.png")');
                clearInterval(rightTimerId);
                leftTimerId = setInterval(function () {
                    moveLeft();
                }, 20);
            });
    
            $('#l').on('touchend mouseup', function leftEnd(e) {
                e.preventDefault();
                lmousedown = false;
                clearInterval(leftTimerId);
            });
    
            $('#r').on('touchstart mousedown', function rightStart(e) {
                e.preventDefault();
                rmousedown = true;
                rex.css('background-image','url("right-rex.png")');
                clearInterval(leftTimerId);
                rightTimerId = setInterval(function () {
                    moveRight();
                }, 20);
            });
    
            $('#r').on('touchend mouseup', function rightEnd(e) {
                e.preventDefault();
                rmousedown = false;
                clearInterval(rightTimerId);
             });
        }
    }

    $('#start').click(()=>{
        $('#start').remove();
        start(); 
    })
})

    

