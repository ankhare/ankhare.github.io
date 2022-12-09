/* function that observes the intersection of each of the entries with the viewport and adds the class show1 when it enters
input: list of elements to observe */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add("show1");
      } 
    });

});

/*function that validates email entries by regular expressoin
returns: boolean valid emai*/
function validateemail(email){
    let regex = /^\S+@\S+\.\S+$/; // allows string@string.string
    return regex.test(email); 
}
/* function that validates phone number if total length is over 16 digits
returns: boolean  */
function validatephone(number){
    return (number.length === 16);
}

/* function that formats and removes invalid 
Input: phone input changed by user
Output: phone input modified and formatted by function*/
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

/* Dictionary object with  key value pairs for month numbers and names*/
const month = {
    '01' : 'Jan','02' : 'Feb','03' : 'Mar','04' : 'April', '05' : 'May', '06' : 'June',
    '07' : 'July', '08' : 'Aug', '09' : 'Sept', '10' : 'Oct','11' : 'Nov','12' : 'Dec',
}

/* Function to format dateTime string into readable date
Input Ex: 2022-12-09T019:30:00-05:00
Output Ex: Dec 09, 2022*/
function getDateFromatted(stringDateTime){
    const selectedDate = stringDateTime.split('T')[0];
    const tokens = selectedDate.split('-');
    return month[tokens[1]] + " " + tokens[2] + " " + tokens[0];
}

/* Function to format dateTime string into a 12 hr clock time
Input Ex: 2022-12-09T019:30:00-05:00
Output Ex: '7:30 pm'*/
function getTimeFormatted(stringDateTime){
    const dt = new Date(stringDateTime);
    let hours = dt.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = (hours % 12) || 12;
    let minutes = dt.getMinutes();
    if (minutes === 0){
        minutes = "00";
    }
    return hours + ":" + minutes + ampm;
}
/* Function that changes the date of div #showChosenDate with a formatted version of the one inputted*/
function appendDate(startDateTime){
    formattedDate = getDateFromatted(startDateTime);
    $('#showChosenDate').text('Selected Date: ' + formattedDate);
}

/* Function that appends to #availableTimeContainer with a div that has the text with the start - end time of the appointment 
and makes the id of the div the event id retrieved from Google Cal*/
function appendTime(id, startDateTime, endDateTime){
    startvalue = getTimeFormatted(startDateTime);
    endvalue = getTimeFormatted(endDateTime)
    $('#availableTimeContainer').append(`<div class="tbtn" id="${id}">${startvalue} - ${endvalue}</div>`);
}

/* Function that is intended to handle when a calendar date is clicked on.  
It takes the attached date string (MM/DD/YYYY) and queries Google Cal for all available dates after 24 hours of date 
and handles the response*/
function showDate(dateText){
    const targetDate = new Date(dateText);
    const targetDateEnd = new Date(targetDate.getTime() + (24 * 60 * 60 * 1000)); //24 hrs from target date
    
    //for debugging
    // availableTimes = [];

    $.ajax({
        type: 'GET',
        url: encodeURI(`https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?key=${env.CALENDAR_API_KEY}`),
        data: {
            'singleEvents': true,
            'orderBy': 'startTime',
            'timeMin': targetDate.toISOString(),
            'timeMax': targetDateEnd.toISOString(),
            'summary': 'Available',
        },
        dataType: 'json',
    })
    .done(function (response) {
        $('#scheduleForm').empty(); //remove schedule form if it is visible
       
        const events = response.items;
        $('#availableTimeContainer').empty();
        events.forEach((item)=>{
            const startDateTime = item.start.dateTime;
            const endDateTime = item.end.dateTime;
            const id = item.id;
            appendDate(startDateTime);
            appendTime(id, startDateTime, endDateTime);
            // availableTimes.push(item);                
        });

        // console.log(availableTimes);
        $('#dateInstructions').text('Choose an apppintment time. Appointments are subject to change.');
        
        //dynamicallly bind function to the click of each timing button after they have all been created
        $('.tbtn').bind('keydown click', finalizeAppointment);
    })
    .fail(function (response) {
        const message = 'Unable to get appointment dates at this time. Please try again later.';
        $('#consultationMessage').text(message);
        console.log(message);
        console.log(response.responseJSON);
    })
    .always(function(){
        console.log('Request to load available times is complete');
    });
}
/* Call back function for when when a div that contians the time component of scheduling is clicked
Stores the id of the div that is clicked on and shows form to finialize appointment*/
function finalizeAppointment(){
    selectedID = $(this).attr('id');
    formattedTime = $(this).text();
    console.log(formattedTime);
    console.log(formattedDate);
    $('#showChosenDate').text('');
    $('#dateInstructions').text('');
    $('#availableTimeContainer').empty();
    $('#scheduleForm').html(`
        <p class="display-9">You're Almost Done!</p>
        <div class="d-flex">
            <p><i class="fa-regular fa-calendar"></i> ${formattedDate}</p><p><i class="fa-regular fa-clock"></i> ${formattedTime}</p>
        </div>
        <hr>
        <form id="scheduleform” name="scheduleform” class="text-left">
            <p id="snamealert" class="text-danger"></p>
            <input id="sname" name="sname" placeholder="Name*" type="input" required>
            <p id="semailalert" class="text-danger"></p>
            <input id="semail" name="semail" placeholder="Email*" type="input" required>
            <p id="sphonealert" class="text-danger"></p>
            <input id="sphone" name="sphone number" placeholder="Phone Number*" type="input" required>
            <button id="consulationbutton">Schedule Consultation</button>
        </form>
    `);
    $('#sphone').bind('keyup',function(){
        $phoneNumber = $('#sphone');
        $phoneNumber.val(phoneFormat($phoneNumber.val()));
    });
    $('#consulationbutton').bind('keydown click', validateConsulationForm);
}

/* Callback function that validates the consultation form when #consultationbutton is clicked on
If there are no errors it calls postForm()*/
function validateConsulationForm(){
    event.preventDefault();
    let noErrors = true;
    const concerns = ['name', 'email', 'phone'];
    concerns.forEach(concern => {
        if (!$('#s' + concern).val()){
            $('#s' + concern + 'alert').text('Invalid ' + concern);
            noErrors = false;
            return;

        } else if(concern === 'email' || concern === 'phone' ){
            const val = $('#s' + concern).val()
            const stringFunction = 'validate' + concern;
            const valid = window[stringFunction](val.trim());
            if(!valid){
                noErrors = false;
                return $('#s' + concern + 'alert').text('Invalid ' + concern);
            } else{
                $('#s' + concern + 'alert').text('');
            }

        } else{
            $('#s' + concern + 'alert').text('');
        }
    })
    
    if(noErrors){
        postphone = $('#sphone').val();
        postname = $('#sname').val();
        postemail = $('#semail').val();
        $('#scheduler').empty();
        postEvent();   
    }   
}

/* Function that patches an update to the selected date by using its ID
It changes the summary of the event so that it will no longer be picked up by the query for "Available" and appends the attendees. 
It changes the visbility of the event for privacy*/
//IMPORTANT NOTE: This requires the use of an OAuth scope, this may result in a temporary inability to use this feature
//"Your consent screen is being shown, but your app has not been reviewed so your users may not see all of your information, and you will not be able to request certain OAuth scopes."
function postEvent(){
    $.ajax({
        Authorization: `{env.CALENDAR_ACCESS_TOKEN}`,
        type: 'PATCH',
        url: encodeURI(`https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events/${selectedID}`),
        data: {
            'summary': 'Reservation request by ' + postphone,
            "attendees": [{
                    "name": postname,
                    "email": postemail,
                }],
            'visibility': 'private',
        },
        dataType: 'json',
    })
    .done(function () {
        $('#consultationMessage').text('Appointment request received. We will reach out to you by email to confirm your appointment shortly.')
        $('#scheduler').empty();
        console.log(`Updated calendar event ${selectedID} to private and patched user data`)
    })
    .fail(function (response) {
        $('#consultationMessage').text('Unable to reserve appointment at this time. Please try again later or try sending us a message below.')
        console.log('IMPORTANT NOTE: This app is under review but requires the use of a protected OAuth scope, this may result in a temporary inability to use this feature');
        console.log('"Your consent screen is being shown, but your app has not been reviewed so your users may not see all of your information, and you will not be able to request certain OAuth scopes."');
        console.log(response.responseJSON);
    })
    .always(function(){
        console.log('Request to patch calendar is complete');
        selectedID = postphone = postemail = postname = undefined; //clear variables
    });
}


$(document).ready(function () {
    let selectedID;
    let formattedDate; 
    let formattedTime;
    let postemail;
    let postname;
    let postphone;
    //attach intersection observer to all elements with the class hidden1
    const hiddenElements = document.querySelectorAll(".hidden1");
    hiddenElements.forEach((el) => observer.observe(el));

    //attach intersection observer to all elements with the class hidden2
    const hidden2Elements = document.querySelectorAll(".hidden2");
    hidden2Elements.forEach((el) => observer.observe(el));

    //create set to hold all available dates within the next 60 days
    let availableSet = new Set();

    //call back function for date picker BeforeShowDay, enables and disables dates according to if they are in the avaiable set or not
    function checkDate(date){
        target = date.toISOString().split('T')[0];

        if(availableSet.has(target)){
            return [true, "", "Book Date"];
        } else{
            return [false, "", "Unavailable"];
        }
    }
    
    //only allow bookings 24 hours from now
    let tomorrow = new Date();
    tomorrow = new Date(tomorrow.getTime() + (24 * 60 * 60 * 1000));
    
    //only allow bookings 60 days out from now
    let future = new Date();
    future.setDate(future.getDate() + 60);

    //get all events from now - 60 days that have the summary of available, including repeating events
    $.ajax({
        type: 'GET',
        url: encodeURI(`https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?key=${env.CALENDAR_API_KEY}`),
        data: {
            'singleEvents': true,
            'timeMin': tomorrow.toISOString(),
            'timeMax': future.toISOString(),
            'summary': 'Available',
        },
        dataType: 'json',
    })
    .done(function (response) {
        //add each item's in the response's date to the availible set
        const events = response.items;
        events.forEach((item)=>{
            const date = item.start.dateTime.split('T')[0];
            availableSet.add(date);                
        });
        //set date picker/ visibile calendar accordingly
        $("#dateDiv").datepicker({
            altField: '#dateInput',
            minDate: '1',
            maxDate: '+60',
            //check dates before putting them on the date picker
            beforeShowDay: checkDate,

            //when date is picked, show the available times for that date
            onSelect: function(dateText) {
                showDate(dateText);
            }
        });

        //display instructions
        $('#dateInstructions').text('Pick an appointment date to get started');

        //if there is an active date, click on it to show the available times
        $('.ui-state-active').click();
        
    })
    .fail(function (response) {
        const message = 'Unable to get appointment dates at this time. Please try again later.';
        $('#consultationMessage').text(message);
        console.log(response.responseJSON);
    })
    .always(function(){
        console.log('Request to load available dates is complete');
    });

    //create new Leaflet object and add in open street map, intitialize location and zoom
    const map = L.map('map', {scrollWheelZoom: false}).setView([42.424993, -83.326150], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 13,
        attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //disable drag on touch screens 
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

    // class to generate icons
    const LocationIcon = L.Icon.extend({
        options: {
            iconUrl: 'media/baseicon.png', //default image
            iconSize: [30, 30]
        }
    });

    //markers is a list of all marker objects
    let markers = [];

    //create new icons
    const baseicon = new LocationIcon();
    const userlocation = new LocationIcon({iconUrl: 'media/currLoc.png', iconSize: [10, 10]});
    
    let group;
    let bounds;
    
    //for each location in list
    for (let i = 0; i < locations.length; i++) {
        // add new marker with the location and the base icon and save it in markers
        markers[i] = new L.marker([locations[i][1], locations[i][2]], {icon: baseicon})
        .addTo(map);

        //add the marker to the map
        markers[i].addTo(map);

        //set the id of the marker
        markers[i]._icon.id = [locations[i][0]];
    }

    //make the spectrum marker and spectrum text the active color to start
    $('#spectrum').addClass('activecolor');
    $('#tspectrum').addClass('active');

    //bind the recentered map view to the #recenter button
    $('#recenter').bind('keydown click', function() {
        map.setView([42.424993, -83.326150], 10);
    });

    //ADD AJAX OR ASYNC FUNCTION HERER
    //bind geolocation and rebounding map to the #showmylocation button
    $('#showmylocation').bind('keydown click', function() {
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

    //when an afilliate is clicked
    $('.affiliate').bind('keydown click', function(e) {
        //remove active class from all other afilliates
        $('.affiliate').removeClass('active');

        //add it to this afilliate
        $(this).addClass('active')

        //do the same for the marker
        $('.leaflet-marker-icon').removeClass('activecolor')
        const iconid = $(this).attr('id').slice(1);
        $('#' + iconid).addClass('activecolor')
    });
    
    const conditions = ['laproscopic surgery', 'hernia surgery', 'appendix surgery', 'gallbladder surgery', 'dad jokes']
    
    //start animation by waiting 1 second and then adding exit class to shown condition
    $('#condition').text(conditions[0]);
    setTimeout(()=>{
        $('#condition').addClass('exit');
    }, 1000)

    let currCondition;
    let nextIndex = 1;

    //then create an interval that changes the current condition every 2 seconds
    const conditionTimerID = setInterval(function(){
        currCondition = conditions[nextIndex];

        //change the text, make it enter
        $('#condition').text(currCondition);
        $('#condition').removeClass('exit');
        $('#condition').addClass('enter');

        //wait 1 second and then make it leave
        setTimeout(()=>{
            $('#condition').removeClass('enter');
            $('#condition').addClass('exit');
        }, 1000)

        nextIndex += 1;

        //if at end of the list, restart
        if ((nextIndex) === conditions.length){
            nextIndex = 0;
        }

    }, 2000);

    //open the procedures section when see all services is clicked
    $('#seeallservices').bind('keydown click', ()=>{
        $('#procedures').click();
    })

    //if document is scrolled to more than the nav height, add scrolled class to make it opaque
    $(document).scroll(function () {
        var $nav = $("nav");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    //bind phone number validation to each key up in phone input
    $('#phone').bind('keyup',function(){
        $phoneNumber = $('#phone');
        $phoneNumber.val(phoneFormat($phoneNumber.val()));
    });

    //toggle the x class everytime the navbar is clicked
    $("button.navbar-toggler").bind('keydown click', function(){
        $(".bar").toggleClass("x");
    });

    //when messsage submit button is clicked
    $('#messagebutton').bind('keydown click', function(event) {
        
        event.preventDefault(); //dont let the form post
        
        let noErrors = true;

        const concerns = ['name', 'email', 'phone', 'message'];

        //for each concern
        concerns.forEach(concern => {

            //check if the value for that concern exists
            if (!$('#' + concern).val()){
                //otherwise add alert text to the document
                $('#' + concern + 'alert').text('Invalid ' + concern);

                //flag that there was an error
                noErrors = false;
                return;

            //if the concern is email or phone
            } else if(concern === 'email' || concern === 'phone' ){

                //validate the entries
                const val = $('#' + concern).val()
                const stringFunction = 'validate' + concern;
                const valid = window[stringFunction](val.trim());
                
                //if it fails, flag the error and add alert text
                if(!valid){
                    noErrors = false;
                    return $('#' + concern + 'alert').text('Invalid ' + concern);
                
                    //other wise remove the alert text
                } else{
                    $('#' + concern + 'alert').text('');
                }
            //otherwise remove the alert text
            } else{
                $('#' + concern + 'alert').text('');
            }
        })
        
        //if we get to this line and there are no errors, the form is valid
        if(noErrors){
            //get all valuess from inputs
            //(there has to be a better way to do this)
            const name = $('#name').val();
            const email = $('#email').val();
            const phone = $('#phone').val();
            const subject = $('#subject').val();
            const message = $('#message').val();

            //post data to Google sheets
            $.ajax({
                url: "https://docs.google.com/forms/d/15TWC53msSHMOCyAPqtfW0nbZfSVd2c3IkHhzg3iQp3A/formResponse",
                crossDomain: true,
                data: {"entry.1776554539": name,
                "entry.1791065834": email,
                "entry.1605266732": phone,
                "entry.1409983036": subject,
                "entry.681565945": message},
                type: "POST",
                dataType: "xml",
                statusCode: {
                    0: function() {
                        $('#contactMessage').text('Form submitted successfully. We look forward to speaking with you soon!') 
                    },
                    200: function() {
                        $('#contactMessage').text('Unable to submit form at this time. Please try again later.') 
                    }
                }
            })
            //empty the contact form after to prevent resubmits
            .always(function(){
                $('#contactUs').empty();
            });
        }     
    });     

    // $('#toggleMap').bind('keydown click', function(){
        
    //     $('#map').toggleClass('hidden');
    //     $('#mapcontrols').toggleClass('hidden');

    //     if($('#map').hasClass('hidden')){
    //         setTimeout(function(){
    //             $('#map').toggleClass('none');
    //             $('#mapcontrols').toggleClass('none');
    //             $('#affiliates').toggleClass('expand');
    //         }, 1000);

    //     }else{
    //         $('#affiliates').toggleClass('expand');
    //         $('#map').toggleClass('none');
    //         $('#mapcontrols').toggleClass('none');
    //     }  
    // });
})