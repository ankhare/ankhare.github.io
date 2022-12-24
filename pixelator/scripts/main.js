'use strict';
// import domtoimage from 'dom-to-image';

$(document).ready(function () {
    let grid = [];
    let grid_count = 30;
    let stack_max = 10;
    let brush_color;
    let grid_stack = [];
    let redo_stack = [];
    let blankGrid = [];
    
    let first_run = true;
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

        if(first_run){
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

        console.log('stack: ' + grid_stack.length);

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
            case(yBrush):{
                ySym($e);
                break;
            }
            case(xBrush):{
                xSym($e);
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
        const id = $e.attr('id');
        const placement = id.split('_');
        const initialI =  parseInt(placement[0]);
        const initialJ =  parseInt(placement[1]);
        const my_stack = [];
        const initial_color = grid[initialI][initialJ].getColor();

        //same color
        if(initial_color === brush_color){
            return;
        }

        my_stack.push([initialI,initialJ]);

        //if the color of the target is not already the brush color
        if(initial_color != brush_color){
            while ( my_stack.length != 0) {
                const curr = my_stack.shift();
                const i = curr[0];
                const j = curr[1];
                
                if(grid[curr[0]][curr[1]].getColor() == initial_color){
                    grid[curr[0]][curr[1]].setColor(brush_color);
                    
                    if(i != grid.length-1){
                        my_stack.push([i+1, j]);
                    }
    
                    if(i != 0){
                        my_stack.push([i-1, j]);
                    }
    
                    if(j != grid.length-1){
                        my_stack.push([i, j+1]);
                    }
    
                    if(j != 0){
                        my_stack.push([i, j-1]);
                    } 
                }
            }
            addToStack(grid);
        }
    }

    const fill1 = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        const i =  parseInt(placement[0]);
        const j =  parseInt(placement[1]);

        //NOTE: make this global if you want to call this function
        fillCounter = 0;

        recursiveFill(i, j, grid[i][j].getColor());
        addToStack(grid);
    }

    const recursiveFill = function(i, j, initial_color){
        fillCounter++;
        //same color
        if(initial_color === brush_color){
            return;
        }
        //prevent looping/overflow: dont recurse more than each pixel in grid and its 4 adjacent neighbors
        if(fillCounter > ((grid_count-1) * (grid_count-1) * 4)){
            return;
        }
        //touch a different color
        if(grid[i][j].getColor() != initial_color){
            return;
        }
        grid[i][j].setColor(brush_color);
        if(x != grid.length-1){
            recursiveFill(i+1, j, initial_color);
        }
        if(x != 0){
            recursiveFill(i-1, j, initial_color);
        }
        if(y != grid.length-1){
            recursiveFill(i, j+1, initial_color);
        }
        if(y != 0){
            recursiveFill(i, j-1, initial_color);
        }  
    };

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

        //ERROR: random blinking pixel that persists even when it fill is gone

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
        console.log('internal undo');
        const latest = grid_stack.pop();
        redo_stack.push(latest);
        
        const target = grid_stack[grid_stack.length-1];
        swapGrid(target);
    }

    const createGrid = function(count){
        console.log('created ' +  grid_count + ' grid');
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

        console.log(grid_stack.length)
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
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        pencilBrush = true;
        fillBucket = false;
        notShape();
        notErase();
        yBrush = false;
        xBrush = false;
    });

    $('#fill').on('click',function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        fillBucket = true;
        pencilBrush = false;
        notShape();
        notErase();
        yBrush = false;
        xBrush = false;
    });


    $('#shape').on('click',function(){
        $('#brushes').children().removeClass('active');
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
        $('#brushes').children().removeClass('active');
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
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        yBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notShape();
        notErase();
        xBrush = false;
    });

    $('#xsim').on('click',function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        xBrush = true;
        pencilBrush = false;
        fillBucket = false;
        notShape();
        notErase();
        yBrush = false;
    });


    $('[id^=menu-]').on('click', function(){
        $('[id^=menu-]').removeClass('active')
        $(this).addClass('active');
        $('[id^=side-]').removeClass('show');
        
        const target = $(this).attr('id').split('-')[1];
        $('#side-' + target).addClass('show');
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

    $('#pngdown').on('click', () => {
        // EDIT use htmlcsstoimage api
        const parent = document.getElementById('sample');
        const node = document.getElementById('grid')
        const canvas = document.createElement('canvas');
        canvas.width = node.scrollWidth;
        canvas.height = node.scrollHeight;

        domtoimage.toPng(node).then(function(pngDataUrl){
            var img = new Image();
            img.onload = function(){
                const context = canvas.getContext('2d');

                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(img, 0, 0)
                parent.appendChild(canvas);
            }
            img.src = pngDataUrl;
        });

    });

    //EDIT: STACK WEIRDNESS when undoing to first point in changed grid!!
    $('#gridInput').on('change', function(e){
        const newCount = e.target.value;
        //change to option to say yes or no

        console.log(first_run);

        // EDIT: only do when there is stuff on grid
        // if(gird ){
            window.alert('Changing the grid size will restart your project. Are you sure you want to continue?');
        // }

        grid_stack = redo_stack = [];
        $(':root').css('--gridcount', `${newCount}`);
        grid_count = newCount;
        createGrid(newCount);
        first_run = true;
        $('#pencil').trigger('click');
    });
});