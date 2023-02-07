'use strict';
$(document).ready(function () {
    let grid = [];
    let grid_count = 30;
    let stack_max = 10;
    let brush_color;
    let grid_stack = [];
    let redo_stack = [];
    let blankGrid = [];
    
    let first_run = true;
    let firstAdd = true;
    let firstAnimation = true;
    let isDragging ;
    let mouseDown;

    let pencilBrush = true;
    let eraseBrush;
    let fillBucket;
    
    let shapeBrush;
    let shapeStart;
    let $blinkingPix;

    let yBrush;
    let xBrush;
    
    let pointCount = 0;

    let animateMap = new Map();
    let animation;
    let animateID;
    let newFrame;

    let editToggle = false;
    let currentSide = 'create';
    let currentBrush = 'pencil';

    class Pixel{
        constructor(color='transparent', id=null){
            this.color = color;
            this.id = id;
        }

        create(id, color='transparent'){
            this.id = id;
            this.color = color;
            $('#grid').append(`<div id="${id}"class="pixel"></div>`);
            $('#' + id).css('background-color', color);
        }

        setColor(color){
            this.color = color;
            $('#' + this.id).css('background-color', color);
        }

        getColor(){
            return this.color
        }
    }

    const bindListeners = function(){
        $('.pixel').on('mousedown', function(e){
            e.preventDefault();
            isDragging = false;
            mouseDown = true;
        })
        .on('mousemove', function(e) {
            isDragging = true;
    
            if (isDragging && mouseDown) {
                drag($(this));
            }
        })
        .on('touchmove touchstart', function(e){
            const x = e.originalEvent.touches[0].pageX;
            const y = e.originalEvent.touches[0].pageY;
            const el = $(document.elementFromPoint(x, y));
            drag(el);
        })
        .on('touchend mouseup', function(){
            if(pencilBrush || eraseBrush || yBrush || xBrush){
                addToStack(grid);
            }
        })
        .on('mouseup', function(e) {
            var wasDragging = isDragging;

            isDragging = false;
            mouseDown = false;
    
            //if we were just dragging
            if (!wasDragging ) {
                drag($(this));
            }
        });
    }

    const cloneGrid = function(grid_in){
        let newGrid = [];
        for (let i=0; i<grid_in.length; i++){
            newGrid [i] = [];
            for (let j=0; j<grid_in.length; j++){
                const new_pixel = new Pixel(grid_in[i][j].getColor(), i + "_" + j);
                newGrid[i][j] = new_pixel;
            }
        }

        if(first_run == true){
            blankGrid = newGrid;
            first_run = false;
        }

        return newGrid;
    }

    const addToStack = function(grid){
        const clonedGrid = cloneGrid(grid);

        if (grid_stack.length < stack_max){
            grid_stack.push(clonedGrid);
        }else{
            grid_stack.shift();
            grid_stack.push(clonedGrid);
        }

        // console.log('stack: ' + grid_stack.length);

        if (grid_stack.length > 0){
            $('#undo').prop('disabled', false);
        }
    }

    const swapGrid = function(grid_in){
        for (let i=0; i<grid.length; i++){
            for (let j=0; j<grid.length; j++){
                grid[i][j].setColor(grid_in[i][j].getColor());
            }
        }
    }
    
    const drag = function($e) {
        //clear redo stack and disable redo button
        redo_stack = [];
        $('#redo').prop('disabled', true);

        switch(true){
            case(yBrush):{
                ySym($e);
                break;
            }
            case(xBrush):{
                xSym($e);
                break;
            }
            case pencilBrush:{
                pencil($e);
                break;
            }case fillBucket:{
                fill($e);
                break
            }case eraseBrush:{
                erase($e);
                break;
            }
            case shapeBrush:{
                shape($e);
                break;
            }
        }
    }

    const pencil = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor(brush_color);
    }

    const ySym = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        const j =  parseInt(placement[1]);
        grid[placement[0]][j].setColor(brush_color);
        grid[placement[0]][grid_count-j].setColor(brush_color);
    }

    const xSym = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        const i =  parseInt(placement[0]);
        grid[i][placement[1]].setColor(brush_color);
        grid[grid_count-i][placement[1]].setColor(brush_color);
    }

    const fill = function($e){
        // get the id of the element clicked on, id will be in the format 'II-JJ'
        const id = $e.attr('id');

        const placement = id.split('_');
        const initialI =  parseInt(placement[0]);
        const initialJ =  parseInt(placement[1]);
        const initial_color = grid[initialI][initialJ].getColor();
        
        //brush color: the color that the user wants to fill with
        //initial color: the color of the div before it was clicked on with the fill brush

        //if brush color and inital color at the same then dont do anythinf
        if(initial_color === brush_color){
            return;
        }

        const queue = [];
        queue.push([initialI,initialJ]);

        //if the color of the target is not already the brush color, proceed
        if(initial_color != brush_color){
            while ( queue.length != 0) {
                //remove the item at the front of the queue
                const curr = queue.shift();

                //get the i and j "coordinates" of the item
                const i = curr[0];
                const j = curr[1];
                
                // if the item's color is the same as the color that we started with
                if(grid[i][j].getColor() == initial_color){
                    //change its color to the brush color
                    grid[i][j].setColor(brush_color);
                    
                    //if not out of the + bounds for i
                    if(i != grid.length-1){
                        queue.push([i+1, j]);
                    }

                    //if not out of the  - bounds for i
                    if(i != 0){
                        queue.push([i-1, j]);
                    }
    
                    //if not out of the + bounds for j
                    if(j != grid.length-1){
                        queue.push([i, j+1]);
                    }
    
                    //if not out of the  - bounds for j
                    if(j != 0){
                        queue.push([i, j-1]);
                    } 
                }
            }
            
            // add the newly filled grid to the undo stack
            addToStack(grid);
        }
    }

    const notShape = function(){
        shapeBrush = false;
        if($blinkingPix){
            $blinkingPix.removeClass('pixel-blink');
        };
        shapeStart = undefined;
    }

    const shape = function($e){
        if($blinkingPix){
            $blinkingPix.removeClass('pixel-blink');
        };
        
        if (!shapeStart){
            let id = $e.attr('id');
            const placement = id.split('_');
            grid[placement[0]][placement[1]].setColor(brush_color);
            shapeStart = id;
            addToStack(grid);
            $blinkingPix = $($e).addClass('pixel-blink');
            pointCount = 1;
            return;
        }


        let sid = $e.attr('id');
        if(sid == shapeStart){
            shapeStart = undefined;
            sid = undefined;
            pointCount = 0;
        }else{
            const line = internalShape(shapeStart, sid);
            if(!line){
                const currentPlacement = sid.split('_');
                grid[currentPlacement[0]][currentPlacement[1]].setColor(brush_color);
                pointCount ++;

                //ending a line 
                 if(pointCount > 1){
                    internalUndo();
                    $blinkingPix.removeClass('pixel-blink');
                    sid = undefined;
                    pointCount = 0;

                //first point
                }else{
                    pointCount++;
                    addToStack(grid);
                    $blinkingPix = $($e).addClass('pixel-blink');
                }
            }else{
                pointCount = 0;
                addToStack(grid);
                $blinkingPix = $($e).addClass('pixel-blink');
            }

            //reinitialize for next run
            shapeStart = sid;
        }
    }

    const internalShape = function(start, stop){
        const startPlacement = start.split('_');
        const startJ =  parseInt(startPlacement[1]);
        const startI =  parseInt(startPlacement[0]);
        
        const stopPlacement = stop.split('_');
        const stopJ =  parseInt(stopPlacement[1]);
        const stopI =  parseInt(stopPlacement[0]);

        let greaterJ;
        let lesserJ;
        let greaterI;
        let lesserI;
        
        // console.log(startPlacement, stopPlacement);
        
        //same row
        if(startI == stopI){
            //"J" based executions
            if(startJ - stopJ > 0){
                greaterJ = startJ;;
                lesserJ = stopJ;
                lesserI = stopI;
            } else{
                greaterJ = stopJ;
                lesserJ = startJ;
                lesserI = startI;
            }
            let curr = lesserJ;
            for(let i=0; i < (greaterJ-lesserJ + 1); i ++){
                grid[lesserI][curr++].setColor(brush_color);
            }
            return true;
        }

        //"I" based executions: all of the below
        if(startI - stopI > 0){
            greaterI = startI;;
            greaterJ = startJ
            lesserI = stopI;
            lesserJ = stopJ;
        } else{
            greaterI = stopI;
            greaterJ = stopJ
            lesserI = startI;
            lesserJ = startJ;
        }

        //same col
        if(startJ == stopJ){
            let curr = lesserI;
            for(let i=0; i < (greaterI-lesserI + 1); i ++){
                grid[curr++][lesserJ].setColor(brush_color);
            }
            return true;
        }

        //shared bottom right to top left diagonal
        if(startI - startJ == stopI - stopJ ){
            let currI = greaterI;
            let currJ = greaterJ;
            for(let i=0; i < (greaterI-lesserI + 1); i ++){
                grid[currI--][currJ--].setColor(brush_color);
            }

            return true;
        }

        // shared bottom left to top right diagonal
        if(startI + startJ == stopI + stopJ ){
            let currI = greaterI;
            let currJ = greaterJ;
            for(let i=0; i < (greaterI-lesserI + 1); i ++){
                grid[currI--][currJ++].setColor(brush_color);
            }

            return true
        }
        return false;
    }

    const notErase = function(){
        eraseBrush = false;
        $('#picker-display, [class^=tg]').removeClass('disabled');
    }

    const erase = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor('transparent');
    }

    const internalUndo = function(){
        // console.log('internal undo');
        const latest = grid_stack.pop();
        redo_stack.push(latest);
        
        const target = grid_stack[grid_stack.length-1];
        swapGrid(target);
    }

    const noFrames = function(){
        clearInterval(animateID);
        firstAdd = firstAnimation = true;
        animation = newFrame = false;
        $('#frameContainer').html("<p>When you add frames they will appear here</p>");
        $('#sampleImg').css('background-image','none');
        $('#sampleImg').html("<p>Add frames to preview your animation here</p>")
        $('#edit').removeClass('show');
    }

    const allowEdit = function(){
        $('#edit').css('color', 'red');
        $('[id^=f-]').addClass('shake');
        $('[id^=f-]').on('click', function(){
            const frameid = $(this).attr('id')
            $(this).remove();
            animateMap.delete(frameid);
            animatePreview();
            if (animateMap.size === 0){
               noFrames();
            }
        });
    }

    const removeEdit = function(){
        $('#edit').css('color', 'inherit');
        $('[id^=f-]').removeClass('shake');
        //TODO: modern unbind listeners
        $('[id^=f-]').unbind('click');
    }

    const bindPlayListener = function(){
        $('#playAnimation').on('click', function(){
            animatePreview();
        })
    }
    const animatePreview = function(){
        if (firstAnimation){
            $('#sampleImg').empty();
            firstAnimation = false;
        }

        if (animation){
            clearInterval(animateID);
        }

        const animateList = Array.from(animateMap.keys());
        if(animateMap.size > 1){
            $('#sampleImg').html('<i id="pauseAnimation" class="fa-solid fa-pause"></i>');
           
            $('#pauseAnimation').on('click', function(){
                clearInterval(animateID);
                $('#sampleImg').html('<i id="playAnimation" class="fa-solid fa-play"></i>');
                bindPlayListener();
            })

            animation = true;
            let currIndex = 0

            
            animateID = setInterval(() => {
                const key = animateList[currIndex];
                const item = animateMap.get(key);
                $('#sampleImg').css('background-image', `url(${item})`);
                currIndex += 1;
                if (currIndex === animateList.length){
                    currIndex = 0;
                }
            }, 1000);
        } else{
            console.log(animateMap);
            console.log("");
            console.log(animateList);
            $('#sampleImg').css('background-image', `url(${animateMap.get(animateList[0])})`);
        }
    }

    const createGrid = function(count){
        // console.log('created ' +  grid_count + ' grid');
        $(':root').css('--gridcount', `${count}`);
        $('#grid').empty();
        grid = [];
        for (let i=0; i<count; i++){
            grid [i] = [];
            for (let j=0; j<count; j++){
                const new_pixel = new Pixel();
                new_pixel.create(i + "_" + j);
                grid[i][j] = new_pixel;
            }
        }
        addToStack(grid);
        bindListeners();
    }

    createGrid(grid_count);

    $('#picker-display').on('click', function(){
        $('#colorpicker').trigger('click');
        $('[class^=tg]').removeClass('activecolor');
        $(this).addClass('activecolor');
    });

    $('#colorpicker').on('change', function(event){
        brush_color = event.target.value;
    })

    $('#undo').on('click', ()=>{
        internalUndo();
        if (grid_stack.length < 2){
            $('#undo').prop('disabled', true);
        }
        // console.log(grid_stack.length)
        $('#redo').prop('disabled', false);
    });

    $('#redo').on('click', function(){
        const target = redo_stack.pop();
        addToStack(target);
        swapGrid(target);
        if(redo_stack.length < 1){
            $('#redo').prop('disabled', true);
        }
    })

    $('[class^=tg]').on('click',function(){
        $('#picker-display').removeClass('activecolor');
        $('[class^=tg]').removeClass('activecolor');
        $(this).addClass('activecolor');
        const target_color = $(this).css('background-color');
        brush_color = target_color;
    });

    //start off with this color initially picked
    $('.tg-c').trigger('click');

    $('#blank').on('click',function(){
        addToStack(blankGrid);
        swapGrid(blankGrid);
    });
    
    $('#pencil').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');

        $(this).addClass('active');
        pencilBrush = true;
        fillBucket = false;
        notShape();
        notErase();
        yBrush = false;
        xBrush = false;
    });

    $('#fill').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');
        $(this).addClass('active');
        fillBucket = true;
        pencilBrush = false;
        notShape();
        notErase();
        yBrush = false;
        xBrush = false;
    });


    $('#shape').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').removeClass('disabled');
        shapeBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notErase();
        yBrush = false;
        xBrush = false;
    });

    $('#erase').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').addClass('disabled');
        eraseBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notShape();
        yBrush = false;
        xBrush = false;
        
    });

    $('#ysim').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');
        $(this).addClass('active');
        yBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notShape();
        notErase();
        xBrush = false;
    });

    $('#xsim').on('click',function(){
        $('#' + currentBrush).removeClass('active');
        currentBrush = $(this).attr('id');
        $(this).addClass('active');
        xBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notShape();
        notErase();
        yBrush = false;
    });

    $('[id^=menu-]').on('click', function(){
        removeEdit();
        editToggle = false;
        $('[id^=menu-]').removeClass('active')
        $(this).addClass('active');
        $('[id^=side-]').removeClass('show');
        
        const target = $(this).attr('id').split('-')[1];
        $('#side-' + target).addClass('show');

        if (newFrame && (target == 'frames')){
            $('#menu-frames').text('Frames ')
        }

        currentSide = target;
    });


    $('#toggleBackground').on('click',function(){
        $('#grid').toggleClass('visible-background');
        $(this).toggleClass('disabled');
        $('#backgroundCheck').toggleClass('hidden');
    });

    $('#toggleGrid').on('click',function(){
        $('.pixel').toggleClass('pixel-border');
        $(this).toggleClass('disabled');
        $('#gridCheck').toggleClass('hidden');
    });

    $('#pngdown, #download').on('click', () => {
        let bg = false

        if ($('#grid').hasClass('visible-background')){
            $('#grid').removeClass('visible-background');
            bg = true;
        }
        $('#loadingscreen').addClass('show');
        domtoimage.toBlob(document.getElementById('grid'))
        .then(function (blob) {
            window.saveAs(blob, 'pixealtor-creation.png');
            if(bg){
                $('#grid').addClass('visible-background');
            }
            $('#loadingscreen').removeClass('show');
        });
    });
    
    $('#edit').on('click', function(){
        if(editToggle){
            removeEdit();
            editToggle = false;
        }else{
            allowEdit();
            editToggle = true;
        }
    });

    $('#add').on('click', (event)=>{
        //TODO: add size reached indication
        if (animateMap.size <= 10){
            if (firstAdd){
                $('#frameContainer').empty();
                $('#edit').addClass('show');
                firstAdd = false;
            }
            let bg = false
            if ($('#grid').hasClass('visible-background')){
                $('#grid').removeClass('visible-background');
                bg = true;
            }

            if(animateMap.size === 10){
                $('#add').prop('disabled', true);
            }

            if ($('#add').prop('disabled') == true && animateMap.size <= 9){
                $('#add').prop('disabled', false);
            }
    
            if(currentSide != 'frames'){
                $('#menu-frames').text('Frames ✨')
                newFrame = true;
            }
    
            $('#loadingscreen').addClass('show');
            var node = document.getElementById('grid');
            domtoimage.toPng(node)
            .then(function (dataUrl) {
                var img = new Image();
                img.src = dataUrl;
                if(bg){
                    $('#grid').addClass('visible-background');
                }
                
                const frameid = `f-${event.timeStamp}`
                img.classList.add('frame');
                img.setAttribute('id', frameid);
                // console.log(frameid);
                $('#frameContainer').append(img);
                animateMap.set(`f-${event.timeStamp}`, dataUrl);
                animatePreview();
                $('#loadingscreen').removeClass('show');
                // console.log(animateMap);
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
        }   
    });

    $('#share').on('click', function(){
        $('#sharetext').text('Copied to Clipboard!');
        navigator.clipboard.writeText('Check out this cool pixel drawing website: https://anshitakhare.com/pixelator');
        setTimeout(function(){
            $('#sharetext').text('Share Website');
        }, 1000)

    })
    $('#gridInput').on('change', function(e){
        const newCount = e.target.value;
        let proceed = false;

        if (window.confirm('Changing the grid size will restart your project and delete all frames. Are you sure you want to continue?')){
            proceed = true;
        }

        if(proceed){
            $(':root').css('--gridcount', `${newCount}`);
            first_run = true;
            grid_stack = redo_stack = [];
            animateMap = new Map();
            noFrames();
            grid_count = newCount;
            createGrid(newCount);
            $('#pencil').trigger('click');
        }else{
            e.target.value = grid_count;
        }
    });
});

//TODO: drag to move frame order
//gif download
//serilaize and download/reupload grid object