// $(document).ready(function(){
// 	$.data(document,"swal",swal);
// })

$.fn.hello=(msg)=>{
	console.log(msg)
}

$.fn.initMNFab = function(){
	$(document).on("mouseenter.fixedActionBtn", ".fixed-action-btn:not(.click-to-toggle)", function(c) {
		var d = $(this);
		$.fn.openMn(d);
	}), 

	$(document).on("mouseleave.fixedActionBtn", ".fixed-action-btn:not(.click-to-toggle)", function(b) {
		var d = $(this);
		$.fn.closeMn(d);
	}), 

	$(document).on("click.fixedActionBtn", ".fixed-action-btn.click-to-toggle > a", function(d) {
		var e = $(this), f = e.parent();
		f.hasClass("active") ?$.fn.closeMn(f) : $.fn.openMn(f);
	});
}

$.fn.openMn = function(b) {
	if ($this = b, $this.hasClass("active") === !1) {
		var c, d, e = $this.hasClass("horizontal");
		e === !0 ? d = 40 : c = 40, $this.addClass("active"), $this.find("ul .btn-floating").velocity({
			scaleY: ".4",
			scaleX: ".4",
			translateY: c + "px",
			translateX: d + "px"
		}, {
			duration: 0
		});
		var f = 0;
		var listNodes = $this.find("ul .btn-floating")
		Array.prototype.reverse.call(listNodes).each(function() {
			$(this).velocity({
				opacity: "1",
				scaleX: "1",
				scaleY: "1",
				translateY: "0",
				translateX: "0"
			}, {
				duration: 80,
				delay: f
			}), f += 40;
		});
	}
}

$.fn.closeMn = function(a) {
	$this = a;
	var b, c, d = $this.hasClass("horizontal");
	d === !0 ? c = 40 : b = 40, $this.removeClass("active"), $this.find("ul .btn-floating").velocity("stop", !0), 
	$this.find("ul .btn-floating").velocity({
		opacity: "0",
		scaleX: ".4",
		scaleY: ".4",
		translateY: b + "px",
		translateX: c + "px"
	}, {
		duration: 80
	});
}

$.fn.initDropdown = function(){
	$('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 125,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on click
        alignment: 'left', // Aligns dropdown to left or right edge (works with constrain_width)
        gutter: 0, // Spacing from edge
        belowOrigin: true // Displays dropdown below the button
    });
}

$.fn.initSideNav = function(){
	var leftnav = $(".page-topbar").height();  
	var leftnavHeight = window.innerHeight - leftnav;
	$('.leftside-navigation').height(leftnavHeight).perfectScrollbar({
	suppressScrollX: true
	});
	$('.sidebar-collapse').sideNav({
		edge: 'left', // Choose the horizontal origin    
	});
}

$.fn.initInput =function(){
	$(document).on("focus", 'input', function() {
		$(this).siblings("label, i").addClass("active");
	})
	console.log($("#username").val())

	// $("input:-webkit-autofill").each(function(){
	// 	// var input = $(this); // This is the jquery object of the input, do what you will
		
	// 	console.log($(this).is(":-webkit-autofill"))
	// });

	$(document).on("blur", 'input', function() {
		var b = $(this);
		b.siblings("label, i").removeClass("active")
	})
	$("input[autofocus]").siblings("label, i").addClass("active")
}

$.fn.addCustomFile = function(){
	var head = document.getElementsByTagName('HEAD')[0];
	var link = document.createElement('link'); 
	link.rel = 'stylesheet';    
	link.type = 'text/css'; 
	link.media = 'screen,projection';   
	link.href = 'assets/css/layouts/page-center.css';  
	head.appendChild(link);  
	$('body').addClass('cyan');
}

$.fn.removeCustomFile = function(){
	$('link[href="assets/css/layouts/page-center.css"]').remove();
	$('body').removeClass('cyan');
}

