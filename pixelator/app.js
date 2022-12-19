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
    let eraseBrush;
    let fillBucket;

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

        console.log(grid_stack.length);

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

        if(pencilBrush){
            pencil($e);
        }

        if(eraseBrush){
            erase($e);
        }

        if(fillBucket){
            fill($e);
        }
    }

    const pencil = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor(brush_color);
        // console.log( grid[placement[0]][placement[1]]);
    }

    const erase = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        grid[placement[0]][placement[1]].setColor('transparent');
    }

    let fillCounter;
    const fill = function($e){
        const id = $e.attr('id');
        const placement = id.split('_');
        const x =  parseInt(placement[0]);
        const y =  parseInt(placement[1]);

        fillCounter = 0;
        recursiveFill(x, y, grid[placement[0]][placement[1]].getColor());
        
    }

    const recursiveFill = function(x, y, initial_color){
        fillCounter++;
        //prevent looping/overflow: dont recurse more than each pixel in grid and its 4 adjacent neighbors
        if(fillCounter > ((grid_count-1) * (grid_count-1) * 4)){
            console.log(fillCounter);
            return;
        }

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

    $('.pixel').bind('mousedown', function(e){
        e.preventDefault();
        isDragging = false;
        mouseDown = true;
    })
    .bind('mousemove', function(e) {
        isDragging = true;

        if (isDragging && mouseDown) {
            drag($(this));
        }
    })
    .bind('touchmove touchstart', function(e){
        const x = e.originalEvent.touches[0].pageX;
        const y = e.originalEvent.touches[0].pageY;
        const el = $(document.elementFromPoint(x, y));
        drag(el);
    })
    .bind('touchend mouseup', function(){
        addToStack(grid);
    })
    .bind('mouseup', function(e) {
        var wasDragging = isDragging;

        isDragging = false;
        mouseDown = false;

        //if we were just dragging
        if (!wasDragging ) {
            drag($(this));
        }
    });

    $('#picker-display').click(function(){
        $('#colorpicker').click();
        $('[class^=tg]').removeClass('activecolor');
        $(this).addClass('activecolor');
    });

    $('#colorpicker').change(function(event){
        brush_color = event.target.value;
    })

    $('#undo').click(()=>{
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

    $('#redo').click(function(){
        const target = redo_stack.pop();

        addToStack(target);
        swapGrid(target);
        if(redo_stack.length < 1){
            $('#redo').prop('disabled', true);
        }
    })

    $('[class^=tg]').click(function(){
        $('#picker-display').removeClass('activecolor');
        $('[class^=tg]').removeClass('activecolor');
        $(this).addClass('activecolor');
        const target_color = $(this).css('background-color');
        brush_color = target_color;
    });

    //start off with this color initially picked
    $('.tg-c').click();

    $('#blank').click(function(){
        addToStack(blankGrid);
        swapGrid(blankGrid);
    });
    
    $('#pencil').click(function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').removeClass('disabled');
        pencilBrush = true;
        eraseBrush = false;
        fillBucket = false;
    });

    $('#erase').click(function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').addClass('disabled');
        eraseBrush = true;
        pencilBrush = false;
        fillBucket = false;
    });

    $('#fill').click(function(){
        $('#brushes').children().removeClass('active');
        $(this).addClass('active');
        $('#picker-display, [class^=tg]').removeClass('disabled');
        fillBucket = true;
        eraseBrush = false;
        pencilBrush = false;
    });

    $('#toggleBackground').click(function(){
        $('#grid').toggleClass('visible-background');
        $(this).toggleClass('disabled');
        $('#backgroundCheck').toggleClass('hidden');
    });

    $('#toggleGrid').click(function(){
        $('.pixel').toggleClass('pixel-border');
        $(this).toggleClass('disabled');
        $('#gridCheck').toggleClass('hidden');
    })
});