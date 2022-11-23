'use strict';
    $(document).ready(function () {
        document.addEventListener("touchstart", function(){}, true);
        
        $("button.navbar-toggler").click(function(){
            $(".bar").toggleClass("x");
        });

        // You can change the speed and amount of cards here
        var cardAmount = 4;
        var flipSpeed = 1500;

        // Preload all images to prevent blank cards
        // because they're switched with CSS classes
        (function preload(imageArray) {
            $(imageArray).each(function(){
                $('<img/>')[0].src = this;
            });
        })(['media/cc.gif',
        'media/jumprex.gif',
        'media/hexdle.gif',
        'media/pyker.jpg']);

        // 3D flip slideshow
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