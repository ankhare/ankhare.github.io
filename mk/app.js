function validateEmail(email){
    let regex = /^\S+@\S+\.\S+$/; // allows string@string.string
    return regex.test(email); 
}

function validatePhone(number){
    let regex = /^[0-9()-]+$/
    if (regex.test(number));
}

$(document).ready(function () {
    // document.querySelectorAll(".afilliate a").forEach(function(a){
    //     a.setAttribute('target', '_blank');
    // })

    const map = L.map('map', {scrollWheelZoom: false, dragging: false}).setView([42.424993, -83.326150], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

    //create list of lists containing id, latitude, longitude
    const locations = [
        ["spectrum", 42.28642, -83.38423],
        ["novi", 42.48774, -83.51835],
        ["southfield", 42.45711, -83.20413],
        ["bw", 42.27303, -83.3646],
        ["sgh", 42.41862, -83.1822]
    ];

    const LocationIcon = L.Icon.extend({
        options: {
            iconSize: [30, 30]
        }
    });

    //create object to hold references to marker ids within the for loop below
    let markers = {};
    const baseicon = new LocationIcon({iconUrl: 'media/baseicon.png'});
    
    for (let i = 0; i < locations.length; i++) {
        let id = [locations[i][0]];
        markers[id] = new L.marker([locations[i][1], locations[i][2]], {icon: baseicon})
        .addTo(map);
        markers[id]._icon.id = id;
    }

    //make spectrum the active color
    $('#spectrum').addClass('activecolor');

    //when an icon is clicked
    $('.leaflet-marker-icon').bind('keydown click', function(e) {
        const $el = $(e.srcElement || e.target);
        //remove active color from old class
        $('.leaflet-marker-icon').removeClass('activecolor')

        //add it to clicked icon
        $el.addClass('activecolor');

        //get the id of the clicked icon
        id = $el.attr('id');

        //the corresponding text for that icon is "t" + id, use that to add active class to that element
        $('.afilliate').removeClass('active');
        $('#t' + id).addClass('active');

        //scroll to the text element
        document.getElementById('t' + id).scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    });


    $('.afilliate').bind('keydown click', function(e) {
        $('.afilliate').removeClass('active');
        $(this).addClass('active')

        $('.leaflet-marker-icon').removeClass('activecolor')
        const iconid = $(this).attr('id').slice(1);
        $('#' + iconid).addClass('activecolor')
    });

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
})