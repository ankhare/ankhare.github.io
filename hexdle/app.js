'use strict';
$(document).ready(function () {
    document.addEventListener("touchstart", function(){}, true);

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

    //initialize canvas conffetti 
    var myConfetti = confetti.create(myCanvas, { resize: true });

    //generate random color
    function randomColor() {
        // Threshold can be between 0 and 127: the higher it is, the more colors are considered to be too grey-like.
        const threshold = 50;

        // Generate three color parts randomly
        const parts = Array.from(Array(3), _ => 
                Math.floor(Math.random()*256)
            ).sort( (a, b) => a-b );
        
        // Check whether they are too close to the same value:
        if (parts[2] - parts[0] < threshold) { // color is too greyish

            // Replace the middle one with a random value outside of the "too close" range
            const exclude = Math.min(255, parts[0] + threshold) 
                        - Math.max(0, parts[2] - threshold);

            parts[1] = Math.floor(Math.random()*(256-exclude));

            if (parts[1] >= parts[2] - threshold) parts[1] += exclude;
        }

        // Shuffle and format the color parts and return the resulting string
        return parts
            .sort( (a, b) => Math.random() < 0.5 )
            .map( p => ('0' + p.toString(16)).substr(-2) )
            .join('');
    }

    //format display based on random color
    const targetcolor = randomColor().toLocaleUpperCase();

    $('#color').css('background-color', '#' + targetcolor);
    $(':root').css('--lg', `#${targetcolor}40`);
    $(':root').css('--border', `#${targetcolor}ee`);
    $(':root').css('--green', `#${targetcolor}`);

    //cheat function easter egg, reveals answer when title is clicked on 3 times
    let counter = 0;  
    function cheat() {
        counter++;
        if(counter == 3){
            $('#alert').append(`low key the answer is ${targetcolor}`);
        } if (counter > 3 | !game){
            $('#color').unbind("click");
        }
    } 
    $('#color').click(()=>{
        cheat();
    })

    //generate grid
    //create rows
    const allowedtries = 6;
    for (let i=0; i < allowedtries; i++ ){//number of rows determined by number of tries allowed
        $('#guesses').append(`<div id="gcont${i}"class="mx-auto gboxcontainer"><div id="g${i}" class="row m-auto my-1">#</div></div>`);  
    }

    //create columns
    for (let r=0; r<6; r++){
        for (let c=0; c<6; c++){ 
        $('#g' + r).append(`<div id="gbox${r}${c}" class="col-2 mx-1 p-0 gbox"><h2 id="gtext${r}${c}" class="m-auto p-0"></h2></div>`);
        }
    }

    //generate keyboard
    const kb1 = ['0','1','2','3','4','5','6','7'];
    const kb2 = ['8','9','A','B','C','D','E','F'];
    for (const i in kb1){
        $('#kb1').append(`<button type="button" id="b${kb1[i]}" class="col mx-1 p-0 kbkey"><h6 class="m-auto">${kb1[i]}</h6></button>`)
        $('#kb2').append(`<button type="button" id="b${kb2[i]}" class="col mx-1 p-0 kbkey"><h6 class="m-auto">${kb2[i]}</h6></button>`)
    }

    //initialize game variables
    let game = true;
    let guess = [];
    let result = ['','','','','',''];

    //right spot
    let green = [];
    
    //in the code but wrong spot
    let yellow = [];

    //not in the code
    let gray = [];

    let currow = 0; // attempt number
    let currcol = 0; // letter input

    //when a keyboard key is clicked
    $('.kbkey').click(function() {
        $('#del').prop('disabled', false);

        if (guess.length < 6){
            const l = $(this).text().trim();
            guess.push(l);
            $('#gbox' + currow + '' + currcol).addClass('shake');
            $('#gtext' + currow + '' + currcol).text(l);
            currcol++;
        }
        
        if (guess.length === 6){
            $('#enter').prop('disabled', false);
            $('.kbkey').prop('disabled', true);
        } 
    })

    //when delete is clicked
    $('#del').click(function(){
        $('#enter').prop('disabled', true);
        if (guess.length > 0){
            guess.pop();
            currcol--;
            $('#gtext' + currow + '' + currcol).text("");
            $('#gbox' + currow + '' + currcol).removeClass('shake');  
        }

        if (guess.length === 0){
            $(this).prop('disabled', true);
        }

        if (guess.length < 6){
            $('.kbkey').prop('disabled', false);
        }
    })

    //when enter is clicked, evaluate results
    $('#enter').click(function(){
        $('#enter').prop('disabled', true);
        $('#color').css('background-color', "#" + guess.join(''));
        $('#color').css('color', "#" + targetcolor);
        // show results
        // find exact matches
        const targetArr = targetcolor.split('');
        for (let i = 0; i < 6; i++){
            if (guess[i] == targetArr[i]){
                result[i] = 'green';
                // $('#gbox' + currow + '' + i).css('background', 'green') 
                green.push(targetArr[i])
                // $('#b' + targetArr[i]).css('background', 'green');
                targetArr[i] = "g"; //block green guess from being recounted
                guess[i] = "y";
            }
        }
        //find matches within target but in in correct location
        // for letter in target
        for (let i = 0; i < 6; i++){
            if (targetArr[i] != "x"){
                let tl = targetArr[i];
                // for letter in guess
                for (let j = 0; j < 6; j++){
                    if (guess[j] == tl){
                        result[j] = 'yellow';
                        // $('#gbox' + currow + '' + j).css('background', 'yellow'); 
                        yellow.push(targetArr[i]);
                        targetArr[i] = "x"; // prevent recounts
                        guess[j] = "y";
                        break;
                    }
                    else if (guess[j] != 'y'){
                        result[j] = 'gray';
                        gray.push(guess[j]);
                    }
                }  
            }
        }
            
        //at the end of every round
        currcol = 0;
        guess = [];

        //show result of guess
        var tilesArray = [$('#gbox' + currow + '' + 0), $('#gbox' + currow + '' + 1), $('#gbox' + currow + '' + 2), $('#gbox' + currow + '' + 3), $('#gbox' + currow + '' + 4), $('#gbox' + currow + '' + 5)]
        tilesArray.map(function (tile, i) {
            tile.addClass('flip');
            tile.css('animation-delay', `${i * 300}ms`);
            setTimeout(() => {
                tile.addClass(result[i]);
            }, i * 300)
        });

        //after results are displayed
        setTimeout(() => {
            //change the color of keyboard
            //change to more effecient method, this one overwrites itself 
            gray.forEach((word, i) => {
                $('#b' + gray[i]).addClass('gray')
            })
            yellow.forEach((word, i) => {
                $('#b' + yellow[i]).addClass('yellow')
            })
            green.forEach((word, i) => {
                $('#b' + green[i]).addClass('green')
            })

            //if answer is completely right
            if (targetArr.join('')=='gggggg'){ 
                $('#color').css('color', 'white');
                confetti();
                if (currow == 0){
                    $('#alert').html('Woah! You solved the Hexdle on your first try!');
                } else{
                    $('#alert').html(`You solved the Hexdle in ${currow + 1} tries!`);
                }
                game = false;

            //if player loses the game
            } else if ((currow + 1) === allowedtries){
                $('#alert').append(`The color was #${targetcolor}. Better luck next time!`)
                game = false;
            
            } else{
                currow ++;
                $('.kbkey').prop('disabled', false);
            } 

            //at the end of game, disable buttons and free memory
            if (game == false){
                $('.kbkey').prop('disabled', true);
                $('#enter').prop('disabled', true);
                $('#del').prop('disabled', true);
                green = [];
                yellow = [];
                gray = [];
                currow = 0;
                currcol = 0;
            }
        }, 2400);
    })
})