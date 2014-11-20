

jQuery(function($) {
    
    // Create New Socket Connection using Socket.io SEBASTIAN
    var socket = io.connect(window.location.hostname);
   
    socket.on('data', function(data) {
        
        var total = data.total;
        for (var key in data.symbols) {
            var val = data.symbols[key] / total;
            if (isNaN(val)) {
                val = 0;
            }
            
            $('li[data-symbol="' + key + '"]').each(function() {
                $(this).css('background-color', 'rgb(' + Math.round(val * 255) +',0,0)');
            });
        }
        
        // Iterate over our tweets
        $.each(data.tweets, function(){
            
            // Add tweet to the list
            $('.tweets').prepend('<li>' + this.text + '</li>');
            console.log(this);
            
        });
        
        $('#last-update').text(new Date().toTimeString());
    }); 
});

