function validateEmail(email){
    let regex = /^\S+@\S+\.\S+$/; // allows string@string.string
    return regex.test(email); 
}

function validatePhone(number){
    let regex = /^[0-9()-]+$/
    if (regex.test(number));
}

$(document).ready(function () {
    document.querySelectorAll(".afilliate a").forEach(function(a){
        a.setAttribute('target', '_blank');
    })

    document.addEventListener("touchstart", function(){}, true);
    let conditionTimerID;
    let currCondition;
    
    const conditions = ['laproscopic surgery', 'hernia surgery', 'appendix surgery', 'gallbladder surgery', 'dad jokes']
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


    $(document).scroll(function () {
        var $nav = $("nav");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
      });

    $("button.navbar-toggler").bind('keydown click', function(){
        $(".bar").toggleClass("x");
    });

    $('#button').bind('keydown click', function validate(event){
        let result = "";
        event.preventDefault();

        let email = document.getElementById("email").value; 
        email = email.trim();

        let phone = document.getElementById("phone").value; 
        phone = phone.trim();

        let name = document.getElementById("name").value; 
        let subject = document.getElementById("subject").value; 
        let message = document.getElementById("message").value; 


        if (name && subject && message && validatePhone(phone) && validateEmail(email)){
            return document.getElementById("theform").submit();
            
        }else{
            if (!name){
                result += "Invalid name <br>";    
            }
            if (!validateEmail(email)){
                result += "Invalid email <br>";                   
            }                
            if (!subject){
                result += "Invalid subject <br>";   
            }
            if (!message){      
                result += "Enter a message <br>";                                  
            }

            document.getElementById("alert").innerHTML = result;
        }
        return result;
    });
       

    $('#toggleMap').bind('keydown click', function(){
        $('#map').toggleClass('hidden');

        if($('#map').hasClass('hidden')){
            setTimeout(function(){
                $('#map').toggleClass('none');
                $('.affiliates').toggleClass('w-100');
            }, 1000);
        }else{
            $('#map').toggleClass('none');
            $('.affiliates').toggleClass('w-100');
        }
        
        
    });

    $('.afilliate').bind('keydown click', function(){
        $('.afilliate').removeClass('active');
        $(this).addClass('active')
    })
})