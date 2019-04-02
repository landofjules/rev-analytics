// IN DEV USE THIS
// mixpanel.opt_out_tracking();

console.log("loaded from pages")

// scroll positions
const OFFSET = 200;
const scrollTrackers = {
  "breakdown":"#breakdown",
  "stats":"#stats",
  "platforms":"#platforms",
  "more stuff":"#more-stuff",
  "contact":"#contact"
};
let hitTracker = Object.assign({},scrollTrackers);
for(sec in hitTracker) hitTracker[sec] = false;
hitTracker['ctaTyped'] = false;

window.onscroll = function () {
    const height = $(window).height();
    const scrollTop = $(window).scrollTop();

		//launch tracking events when the user scrolls past points
    if(location.hostname.match('dreamlionagency')){
      for(sec in scrollTrackers) {
          let obj = $(scrollTrackers[sec])
          let pos = obj.offset()
          if( !hitTracker[sec] && height + scrollTop - OFFSET > pos.top) {
              console.log(sec);
              mixpanel.track("Scrolled to "+sec);
              hitTracker[sec]=true;
          }
      }
    }
    // restore the kommunicate chat if user scrolls out of contact
    if (height + scrollTop < $("#contact").offset().top) {
      if($("#mck-sidebox-launcher").is(":hidden")) {
        $("#mck-sidebox-launcher").fadeIn(); 
      }
    }
}


//mixpanel events
$('.nav').click(()=> mixpanel.track("Menu Click"))
$('.review-poll-block').click(()=> mixpanel.track("Use Poll"));
$('#more-stats').click(()=> mixpanel.track("Open More Stats"));
$('#contact-top').click(()=> mixpanel.track("Contact from top"));
$('#contact-middle').click(()=> mixpanel.track("Contact from middle"));

// hide kommunicate when selecting input
$('input').focus(()=> {
  if(!hitTracker['ctaTyped']) {
    console.log("cta typed");
    mixpanel.track("Started Typing");
  	hitTracker['ctaTyped']=true;
  }
 	if(!$("#mck-sidebox-launcher").is(":hidden")) {
    $("#mck-sidebox-launcher").fadeOut();
  }
});

// jquery validator plugin for phone
console.log("Loaded review lead form js")
jQuery.validator.addMethod('phoneUS', function(phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, ''); 
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
}, 'Please enter a valid phone number.');

//define nav functions
const navNext = () => {
    $(".review-form-business-section").fadeOut(300,() =>
        $(".review-form-personal-section").fadeIn()
    )
    $("#next-button").fadeOut(300,() => {
        $("#back-button").fadeIn();
        $("#submit-button").fadeIn();
    });
}
const navBack = () => {
    $(".review-form-personal-section").fadeOut(300, () => {
        $(".review-form-business-section").fadeIn()
    })
    $("#submit-button").fadeOut(300, () => {
        $("#next-button").fadeIn();
    });
    $("#back-button").fadeOut(300);   
}

$(".review-form-personal-section").hide()
$("#submit-button").hide();
$("#back-button").hide();

// validation for form
const validator = $("#review-lead-form").validate({
    debug: true,
    errorClass:"review-error",
    errorElement: "span",
    ignore: 'input[type="button"],input[type="submit"]',
    rules: {
        business: "required",
        phone: {
            "required": true,
            "phoneUS": true
        },
        address: {
            "required": true,
            "minlength": 10
        },
        name: "required",
        email: {
            required: true,
            email: true
        },
    },
    messages: {
        business: "Please enter your business name",
        phone: {
            required: "Please provide your business phone number",
            phoneUS: "Please enter a valid number"
        },
        address: "Please enter your business address",
        name: "Please enter your name",
        email: "Please enter a valid email address"
    },
    submitHandler: function(form) {
        mixpanel.track("Submitted");
        form.submit();
    }
});

// clicking the next button from business and validating
$('#next-button').click(function () {
    const tab = $(".review-form-business-section");
    let valid = true;

    // iterate through each element in tab and validate
    $('input', tab).each(function(i, v){
        valid = validator.element(v) && valid;
    });
    valid = validator.element("#address") && valid;
    
     mixpanel.track("Clicked Next In Form", {
    	business:$("#business").val(),
      phone:$("#phone").val(),
      address:$("#address").val(),
     })

    // next tab if valid
    if(!valid){
        return;
    } else {
        navNext();
    }

});

//clicking the back button
$('#back-button').click(navBack);