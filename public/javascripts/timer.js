// if there are any items in the cart
if ($('#cart-qty').text() > 0) {
    //// TESTING sessionStorage Timer
    const start = sessionStorage.start || Date.now();
    const timespan = 1800000;
    const delay = 1000;


    function countdown() {
        const now = Date.now();
        // show visual timer
        $('#timer-count-down').show('slow');

        // begin visual timer
        $('#timer').html((Math.floor((now - start - timespan) / 1000) * -1));

        if (now - start < timespan) {
            setTimeout(countdown, delay);
        } else {
            delete sessionStorage.start;
        }
    }

    if (!sessionStorage.start) {
        sessionStorage.start = start;
    }

    countdown();

    $.get('/clearcart', function (response) {
        // remove cart quantity notification from navbar
        $('#cart-qty').text('');
        // redirect to /products
        window.location = '/shopping-cart';
    });

}
