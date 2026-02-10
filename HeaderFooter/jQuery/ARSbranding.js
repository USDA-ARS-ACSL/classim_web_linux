$(document).ready(function() {
	// load the header and footer first
	w3.includeHTML();
	
	// load the uswds.min.js after loading the header and footer
	$.getScript("./HeaderFooter/USWDS/js/uswds.min.js");		
});

// close dropdown menu when clicking outside of it
$(document).on("click", function (event) {
	var buttonElements = $("ul > li > button");

	for (var i = 1; i <= buttonElements.length; i++) 
	{
		var element = buttonElements.eq(i);
		if((event.target.id != "btnMenu-"+i) && ($(event.target).parent().next().attr('id') != "side-nav-"+i))
		{
			$('#btnMenu-' + i).attr('aria-expanded', 'false');
			$('#side-nav-' + i).attr('aria-hidden', 'true');
		}
	}
}); 
