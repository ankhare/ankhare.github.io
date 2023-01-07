'use strict';
$(window).on('load', function(){
    $('#content').removeClass('hide');
    $('#loader').hide();
});

$(document).ready(function () {
    $('body').on('touchstart', function() {});
    
    $('.featured').addClass('showfilter');
    
    $('#category').addClass('showfilter');
    
    $("button.navbar-toggler").click(function(){
        $(".bar").toggleClass("x");
    });

    $('a.nav-link').click(()=>{
        $('button.navbar-toggler').click();
    })

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting){
            entry.target.classList.add("show1");
          } 
        //   else{
        //     entry.target.classList.remove("show1");
        //   }
        });

    });
    
    const hiddenElements = document.querySelectorAll(".hidden1");
    hiddenElements.forEach((el) => observer.observe(el));

    const hidden2Elements = document.querySelectorAll(".hidden2");
    hidden2Elements.forEach((el) => observer.observe(el));

    const tags = ['featured', 'games', 'web development', 'machine learning', 'generative art', 'javascript', 'python','java'];

    tags.forEach((tag) => {
        const filter = tag.replace(/\s+/g, '');
        const elements = $('.' + filter).find('.tags');
        elements.append(`<div class="tag highlight">${tag + " "}`);
    });

    $(document).scroll(function () {
        var $nav = $("nav");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    $("#filterby").change(function(event){
        const resp = event.target.value;
        let number;
        $('.option').removeClass('showfilter');
        $('#' + resp).addClass('showfilter');

        //add active class only to first item in each category 
        $('.btn').removeClass('active');
        $('.filter').removeClass('showfilter');

        if(resp === 'language'){
            $('#javascript').addClass('active');
            $('.javascript').addClass('showfilter'); 
            number = $('.javascript').length;
        } else if(resp == 'category'){
            $('#featured').addClass('active');
            $('.featured').addClass('showfilter'); 
            number = $('.featured').length;
        }

        $('#results').text(number);
    });

    $('.cbtn').bind('keydown click', function(){
        const type = $(this).attr('id');
        let number;
       
        if (type.includes('viewall')){
            $('.filter').addClass('showfilter');
            number = " all " + $('.filter').length;
        }else{
            $('.filter').removeClass('showfilter');
            $('.' + type).addClass('showfilter');
            number = $('.' + type).length;
        }   

        $('.btn').removeClass('active');
        $(this).addClass('active')

        $('#results').text(number)
    });

    //credit for flip slide card base to https://codepen.io/niklanus/pen/OXVwgW
    const cardAmount = 4;
    const flipSpeed = 5000;
    
    (function preload(imageArray) {
        $(imageArray).each(function(){
            $('<img/>')[0].src = this;
        });
    })(['media/cc.gif',
    'media/pixelator.gif',
    'media/hexdle.gif',
    'media/jumprex.gif']);

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

    $('#featured').trigger('click');
 })