'use strict';
        $(document).ready(function () {
            // document.addEventListener("touchstart", function(){}, true);
            let grid = [];
            const grid_count = 30;
            let brush_color = '#C0392B';
            let grid_stack = [];
            let stack_max = 10;
            let blankGrid = [];
            let first_run = true;

            class Pixel{
                constructor(color='transparent', active=false, id=null){
                    this.active = active;
                    this.color = color;
                    this.id = id;
                }

                setColor(color){
                    this.color = color;
                    this.active = true;
                }

                create(id, color='transparent'){
                    this.id = id;
                    this.color = color;
                    $('#grid').append(`<div id="${id}"class="pixel"></div>`);
                    $('#' + id).css('background-color', color);
                }

                setState(color, active){
                    this.active = active;
                    this.color = color;
                    $('#' + this.id).css('background-color', color);
                }

                getColor(){
                    return this.color;
                }
                
                getActive(){
                    return this.active;
                }
            }

            const cloneGrid = function(grid_in){
                let newGrid = [];
                for (let i=0; i<grid_in.length; i++){
                    newGrid [i] = [];
                    for (let j=0; j<grid_in.length; j++){
                        const new_pixel = new Pixel(grid_in[i][j].getColor(), grid_in[i][j].getActive(), i + "_" + j);
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
                // console.log(grid_stack);

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
                        grid[i][j].setState(grid_in[i][j].getColor(), grid_in[i][j].getActive() );
                    }
                }
            }
            
            let pencilBrush = true;
            let eraseBrush;
            const drag = function($e) {
                if(pencilBrush){
                    pencil($e);
                }

                if(eraseBrush){
                    erase($e);
                }
            }

            const pencil = function($e){
                const id = $e.attr('id');
                const placement = id.split('_');
                grid[placement[0]][placement[1]].setState(brush_color, true);
                // console.log( grid[placement[0]][placement[1]]);
            }

            //ADD DISABLING COLOR SELECTION WHEN IN ERASER
            const erase = function($e){
                const id = $e.attr('id');
                const placement = id.split('_');
                grid[placement[0]][placement[1]].setState('transparent', false);
                // console.log( grid[placement[0]][placement[1]]);
            }

            let isDragging = false;
            let mouseDown = false;
            let touchCounter = 0;
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
            .bind('touchend', function(){
                addToStack(grid);
            })
            .bind('mouseup', function(e) {
                e.preventDefault();
                addToStack(grid);
                var wasDragging = isDragging;

                isDragging = false;
                mouseDown = false;

                if (!wasDragging ) {
                    console.log('mouseup')
                    drag($(this));
                }
            });

            $('#color').blur(function(event){
                brush_color = event.target.value;
            })

            $('#undo').click(()=>{
                grid_stack.pop();
                const last_grid = grid_stack[grid_stack.length-1];
                swapGrid(last_grid);

                if (grid_stack.length < 2){
                    $('#undo').prop('disabled', true);
                }
            });

            $('[class^=tg]').click(function(){
                $('[class^=tg]').removeClass('activecolor');
                $(this).addClass('activecolor');
                const target_color = $(this).css('background-color');
                brush_color = target_color;
            });

            $('#blank').click(function(){
                swapGrid(blankGrid);
            });

            
            $('#pencil').click(function(){
                $('#brushes').children().removeClass('active');
                $(this).addClass('active');
                pencilBrush = true;
                eraseBrush = false;
            });

            $('#erase').click(function(){
                $('#brushes').children().removeClass('active');
                $(this).addClass('active');
                pencilBrush = false;
                eraseBrush = true;
            });

            $('#toggleBackground').click(function(){
                $('#grid').toggleClass('visiblebackground');
                $(this).toggleClass('disabled')
            });

            $('#toggleGrid').click(function(){
                $('.pixel').toggleClass('no-border');
                $(this).toggleClass('disabled');
            })
            
        });