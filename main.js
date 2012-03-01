"use strict";

(function(){
    var map;

    $(function initialize() {
        var myOptions = {
            center: new google.maps.LatLng(44.84, -0.6),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    });
    
    $(function(){
        var kmllayer = new google.maps.KmlLayer('http://davidbruant.github.com/OpenDataLab2012/BDVBDX.kml', {
            map: map,
            clickable: true
        });
        google.maps.event.addListener(kmllayer, 'status_changed', function(){
            console.log('status changed event');
            console.log('new status', kmllayer.getStatus());
        })


        console.log('kmllayer status', kmllayer.getStatus());
        
        //kmllayer.setMap(map);
    })
})();

