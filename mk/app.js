$(document).ready(function () {
    document.addEventListener("touchstart", function(){}, true);
    let conditionTimerID;
    let currCondition;
    
    const conditions = ['laproscopic surgery', 'hernia surgery', 'appendectomy', 'gallbladder surgery']
    $('#condition').text(conditions[0]);
    let nextIndex = 1;

    conditionTimerID = setInterval(function(){
        currCondition = conditions[nextIndex];
        $('#condition').text(currCondition);
        nextIndex += 1;
        if ((nextIndex) === conditions.length){
            nextIndex = 0;
        }
    }, 2000);

    
    $("button.navbar-toggler").click(function(){
        $(".bar").toggleClass("x");
    });


})