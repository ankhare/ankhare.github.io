'use strict';
$(document).ready(function () {
    let grid = [];
    const grid_count = 30;
    let stack_max = 10;
    let brush_color;
    let grid_stack = [];
    let redo_stack = [];
    let blankGrid = [];
    let first_run = true;
    let isDragging = false;
    let mouseDown = false;
    let pencilBrush = true;
    let fillBucket;
    let shapeBrush;
    let eraseBrush;

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

        if (grid_stack.length > 1){
            $('#undo').prop('disabled', false);
        }
    }

    const createGrid = function(count){
        for (let i=0; i<count; i++){
            grid [i] = [];
            for (let j=0; j<count; j++){
                const new_pixel = new Pixel();
                new_pixel.create(i + "_" + j);
                grid[i][j] = new_pixel;
            }
        }
        addToStack(grid);
    }

    createGrid(grid_count);

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

        }
    }

    const pencil = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor(brush_color);
    }

    let fillCounter;
    const fill = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        const x =  parseInt(placement[0]);
        const y =  parseInt(placement[1]);

        fillCounter = 0;

        recursiveFill(x, y, grid[placement[0]][placement[1]].getColor());
        console.log(fillCounter);
        
    }

    const recursiveFill = function(x, y, initial_color){
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
        if(grid[x][y].getColor() != initial_color){
            return;
        }

        grid[x][y].setColor(brush_color);
        

        if(x != grid.length-1){
            recursiveFill(x+1, y, initial_color);
        }
        if(x != 0){
            recursiveFill(x-1, y, initial_color);
        }
        if(y != grid.length-1){
            recursiveFill(x, y+1, initial_color);
        }
        if(y != 0){
            recursiveFill(x, y-1, initial_color);
        }  
    };

    let shapeStart;
    let shapeStop;
    const shape = function($e){
        if (!shapeStart){
            let id = $e.attr('id');
            const placement = id.split('_');
            grid[placement[0]][placement[1]].setColor(brush_color);
            shapeStart = id;
            console.log(shapeStart, shapeStop);
            return;
        }

        
        let sid = $e.attr('id');
        console.log(shapeStart, sid);
        internalShape(shapeStart, sid);
            
        //reinitialize for next run
        shapeStart = sid;
        shapeStop = null;
    }

    const internalShape = function(start, stop){
        const startPlacement = start.split('_');
        const startX =  parseInt(startPlacement[1]);
        const startY =  parseInt(startPlacement[0]);
        
        const stopPlacement = stop.split('_');
        const stopX =  parseInt(stopPlacement[1]);
        const stopY =  parseInt(stopPlacement[0]);

        let greaterX;
        let lesserX;
        let greaterY;
        let lesserY;
        
        console.log(startPlacement, stopPlacement);
        
        //same row
        if(startY == stopY){
            if(startX - stopX > 0){
                greaterX = startX;;
                lesserX = stopX;
                lesserY = stopY;
            } else{
                greaterX = stopX;
                lesserX = startX;
                lesserY = startY;
            }
            let curr = lesserX;
            for(let i=0; i < (greaterX-lesserX + 1); i ++){
                grid[lesserY][curr].setColor(brush_color);
                curr = curr + 1;
            }
            return;
        }

        //same col
        if(startX == stopX){
            if(startY - stopY > 0){
                greaterY = startY;;
                lesserY = stopY;
                lesserX = stopX;
            } else{
                greaterY = stopY;
                lesserY = startY;
                lesserX = startX;
            }
            let curr = lesserY;
            for(let i=0; i < (greaterY-lesserY + 1); i ++){
                grid[curr][lesserX].setColor(brush_color);
                curr = curr + 1;
            }
            return;
        }


    }

    const erase = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor('transparent');
    }


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
        addToStack(grid);
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

    $('#picker-display').on('click', function(){
        $('#colorpicker').trigger('click');
        $('[class^=tg]').removeClass('activecolor');
        $(this).addClass('activecolor');
    });

    $('#colorpicker').on('change', function(event){
        brush_color = event.target.value;
    })

    $('#undo').on('click', ()=>{
        const latest = grid_stack.pop();
        redo_stack.push(latest);
        
        const target = grid_stack[grid_stack.length-1];
        swapGrid(target);

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
        $('#picker-display, [class^=tg]').removeClass('disabled');
        pencilBrush = true;
        fillBucket = false;
        shapeBrush = false;
        eraseBrush = false;
    });

    $('#fill').on('click',function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').removeClass('disabled');
        fillBucket = true;
        pencilBrush = false;
        shapeBrush = false;
        eraseBrush = false;
    });

    $('#erase').on('click',function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').addClass('disabled');
        eraseBrush = true;
        pencilBrush = false;
        fillBucket = false;
        shapeBrush = false;
    });

    $('#shape').on('click',function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').removeClass('disabled');
        shapeBrush = true;
        pencilBrush = false;
        fillBucket = false;
        eraseBrush = false;
        
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
});