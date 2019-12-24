// fade out any flash messages after 2 seconds
// if($('#flash')) {
// 	$('#flash').delay(2000).fadeOut('slow');
// }

// if there are any items in the cart
if($('#cart-qty').text() > 0) {
	// start a timer
	setTimeout(function() {
		// after time runs out, confirm if user wants to clear their cart
		if(confirm('Clear your cart?')) {
			// send a request to the clearcart route
			$.get('/clearcart', function(response) {
				// notify user that cart has been cleared
				alert(response.message);
				// remove cart quantity notification from navbar
				$('#cart-qty').text('');
			});
		}
	}, 3000);
} 