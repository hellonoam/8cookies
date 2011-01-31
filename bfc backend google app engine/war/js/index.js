function init() {
	$(".email").keypress(function(event) {
		if (event.charCode == 13)
			$("input[type='submit']").click();
	});
	$("input[type='submit']").click(function() {
		$(".main p").text("you'll know");
		$(".inside").hide();
		$(".main").height(50);
		$.ajax({
			url: server + "/BetaSignUp",
			data: { email: $(".email").val() },
			cached: false,
			dataType: "jsonp"
		});
	})
}

var uservoiceOptions = {
  /* required */
  key: '8cookies',
  host: '8cookies.uservoice.com', 
  forum: '96147',
  showTab: true,  
  /* optional */
  alignment: 'left',
  background_color:'#5C9FC0', 
  text_color: 'white',
  hover_color: '#06C',
  lang: 'en'
};

function _loadUserVoice() {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', ("https:" == document.location.protocol ? "https://" : "http://") + "cdn.uservoice.com/javascripts/widgets/tab.js");
  document.getElementsByTagName('head')[0].appendChild(s);
}
_loadSuper = window.onload;
window.onload = (typeof window.onload != 'function') ? _loadUserVoice : function() { _loadSuper(); _loadUserVoice(); };