function validateemail(email){
    let regex = /^\S+@\S+\.\S+$/; // allows string@string.string
    return regex.test(email); 
}

function validatephone(number){
    return (number.length === 16);
}

function phoneFormat(input){
    //remove formatting from input
    input = input.replace(/\D/g,'');
    
    //ensure that the size of the actual input is less than 10/valid number
    input = input.substring(0,10);

    // switch statment depending on size of length;
    var size = input.length;
    
    switch(true){
    case (size === 0):
        input = input;
        break;
    //add ( to begining when input is less than 4 numbers
    case (size < 4):
        input = '(' +input;
        break;
    //surround first 3 numbers with () and place rest after when input is greater than 4 but less than 7
    case (size < 7):
        input = '('+input.substring(0,3)+') '+input.substring(3,6);
        break;
    //format entire number when 7 numbers are inputted
    case(size >= 7):
        input = '('+input.substring(0,3)+') '+input.substring(3,6)+' - '+input.substring(6,10);
        break;
    }

    return input;  
}

$(document).ready(function () {
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

    // document.addEventListener("touchstart", function(){}, true);
    const map = L.map('map', {scrollWheelZoom: false}).setView([42.424993, -83.326150], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 13,
        attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    if(window.ontouchstart !== undefined){
        map.dragging.disable();
    }
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
            iconUrl: 'media/baseicon.png',
            iconSize: [30, 30]
        }
    });

    //create object to hold references to marker ids within the for loop below
    let markers = [];
    const baseicon = new LocationIcon();
    const userlocation = new LocationIcon({iconUrl: 'media/currLoc.png', iconSize: [10, 10]});
    let group;
    let bounds;

    
    for (let i = 0; i < locations.length; i++) {
        let id = [locations[i][0]];
        markers[i] = new L.marker([locations[i][1], locations[i][2]], {icon: baseicon})
        .addTo(map);
        markers[i].addTo(map);
        markers[i]._icon.id = id;
    }

    //make spectrum the active color
    $('#spectrum').addClass('activecolor');

    $('#recenter').bind('keydown click', function() {
        map.setView([42.424993, -83.326150], 10);
    });

    $('#showmylocation').bind('keydown click', function() {
        // $(this).prop('disabled', 'disabled');
        $('#locationrelated').replaceWith("<div id='#locationrelated' class='d-flex'><p id='viewmylocation'><i class='fa-solid fa-location-arrow'></i>&ensp;View My Location</p></div");
        
        $('#viewmylocation').bind('keydown click', function() {
            map.flyToBounds(bounds, {duration: 1});
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { coords: { latitude, longitude }} = position;
    
                const currLoc = new L.marker([latitude, longitude], {icon: userlocation});
                currLoc.addTo(map);
                markers.push(currLoc);
    
                group =  L.featureGroup(markers);
                bounds = group.getBounds();
                map.flyToBounds(bounds, {duration: 1});
            });
        } else {
            $('#locationalert').text('This browser does not support geolocation.')
        }
    });

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
        $('.affiliate').removeClass('active');
        $('#t' + id).addClass('active');

        //scroll to the text element
        document.getElementById('t' + id).scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    });

    $('.affiliate').bind('keydown click', function(e) {
        $('.affiliate').removeClass('active');
        $(this).addClass('active')

        $('.leaflet-marker-icon').removeClass('activecolor')
        const iconid = $(this).attr('id').slice(1);
        $('#' + iconid).addClass('activecolor')
    });
    
    let conditionTimerID;
    let currCondition;
    
    const conditions = ['laproscopic surgery', 'hernia surgery', 'appendix surgery', 'gallbladder surgery', 'dad jokes']
    $('#condition').text(conditions[0]);
    setTimeout(()=>{
        $('#condition').addClass('exit');
    }, 1000)

    let nextIndex = 1;

    conditionTimerID = setInterval(function(){
        currCondition = conditions[nextIndex];

        $('#condition').text(currCondition);
        $('#condition').removeClass('exit');
        $('#condition').addClass('enter');
        setTimeout(()=>{
            $('#condition').removeClass('enter');
            $('#condition').addClass('exit');
        }, 1000)
        
        nextIndex += 1;

        if ((nextIndex) === conditions.length){
            nextIndex = 0;
        }

    }, 2000);

    $('#seeallservices').bind('keydown click', ()=>{
        setTimeout($('#procedures').click());
        
    })

    $(document).scroll(function () {
        var $nav = $("nav");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    $('#phone').bind('keyup',function(){
        $phoneNumber = $('#phone');
        $phoneNumber.val(phoneFormat($phoneNumber.val()));
    });

    $("button.navbar-toggler").bind('keydown click', function(){
        $(".bar").toggleClass("x");
    });

    $('#button').bind('keydown click', function(event) {
        event.preventDefault();

        let noErrors = true;

        const concerns = ['name', 'email', 'phone', 'message'];

        concerns.forEach(concern => {
            if (!$('#' + concern).val()){
                $('#' + concern + 'alert').text('Invalid ' + concern);
                noErrors = false;
                return;

            } else if(concern === 'email' || concern === 'phone' ){
                const val = $('#' + concern).val()
                const stringFunction = 'validate' + concern;
                const valid = window[stringFunction](val.trim());
                if(!valid){
                    noErrors = false;
                    return $('#' + concern + 'alert').text('Invalid ' + concern);
                } else{
                    $('#' + concern + 'alert').text('');
                }

            } else{
                $('#' + concern + 'alert').text('');
            }
        })
        
        if(noErrors){
            $('#successmessage').text('From submitted successfully. We look forward to speaking with you soon!')
            return document.getElementById("contactform").submit();
        }     
    });
       

    $('#toggleMap').bind('keydown click', function(){
        
        $('#map').toggleClass('hidden');
        $('#mapcontrols').toggleClass('hidden');

        if($('#map').hasClass('hidden')){
            setTimeout(function(){
                $('#map').toggleClass('none');
                $('#mapcontrols').toggleClass('none');
                $('#affiliates').toggleClass('expand');
            }, 1000);

        }else{
            $('#affiliates').toggleClass('expand');
            $('#map').toggleClass('none');
            $('#mapcontrols').toggleClass('none');
        }  
    });
})