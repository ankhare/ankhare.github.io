'use strict';
$(document).ready(function () {
    $('body').on('touchstart', function() {});
    
    $('.featured').addClass('show');
    
    $('#category').addClass('show');
    
    $("button.navbar-toggler").click(function(){
        $(".bar").toggleClass("x");
    });

    const tags = ['featured', 'games', 'web development', 'machine learning', 'generative art', 'javascript', 'python','java'];

    tags.forEach((tag) => {
        const filter = tag.replace(/\s+/g, '');
        const elements = $('.' + filter).find('.tags');
        elements.append(`<div class="tag highlight">${tag + " "}`);
    });


    $("#filterby").change(function(event){
        const resp = event.target.value;
        let number;
        $('.option').removeClass('show');
        $('#' + resp).addClass('show');

        //add active class only to first item in each category 
        $('.btn').removeClass('active');
        $('.filter').removeClass('show');

        if(resp === 'language'){
            $('#javascript').addClass('active');
            $('.javascript').addClass('show'); 
            number = $('.javascript').length;
        } else if(resp == 'category'){
            $('#featured').addClass('active');
            $('.featured').addClass('show'); 
            number = $('.featured').length;
        }

        $('#results').text(number);
    });

    $('.cbtn').bind('keydown click', function(){
        const type = $(this).attr('id');
        let number;
       
        if (type.includes('viewall')){
            $('.filter').addClass('show');
            number = " all " + $('.filter').length;
        }else{
            $('.filter').removeClass('show');
            $('.' + type).addClass('show');
            number = $('.' + type).length;
        }   

        $('.btn').removeClass('active');
        $(this).addClass('active')

        $('#results').text(number)
    });

    //credit for flip slide show to https://codepen.io/niklanus/pen/OXVwgW
    const cardAmount = 4;
    const flipSpeed = 2000;
    
    (function preload(imageArray) {
        $(imageArray).each(function(){
            $('<img/>')[0].src = this;
        });
    })(['media/cc.gif',
    'media/jumprex.gif',
    'media/hexdle.gif',
    'media/pyker.jpg']);

    (function bfCards(elements, speed) {
    var cards = $('.cards');
    var container = cards.children('.cards__container');
    var front = container.children('.cards__front');
    var back = container.children('.cards__back');

    function swapArticleClass(element, newClass) {
        element.removeClass(function(index, css) {
        return (css.match(/(^|\s)card-\S+/g) || []).join(' ');
        });

        element.addClass(newClass);
    }

    var onTick = function(i) {
        setTimeout(function() {
        var nextClass;
        var currentClass = 'card-' + i;

        if (currentClass === elements)  {
            nextClass = 'card-' + (i + 1);
        } else {
            nextClass = 'card-1';
        }

        if (i % 2 === 0) {
            cards.addClass('is-flipped');
            swapArticleClass(back, currentClass);
            setTimeout(function() {
            swapArticleClass(front, nextClass);
            }, speed / 2);
        } else {
            cards.removeClass('is-flipped');
            swapArticleClass(front, currentClass);
            setTimeout(function() {
            swapArticleClass(back, nextClass);
            }, speed / 2);
        }
        }, speed * i);
    };

    function cycle() {
        for (var i = 1; i <= elements; i++) {
        onTick(i);
        }
    };

    cycle();
    setInterval(cycle, speed * elements);
    })(cardAmount, flipSpeed);
    
 })