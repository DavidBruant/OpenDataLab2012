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
        var kmllayer = new google.maps.KmlLayer('./BDVBDX.kml');
        kmllayer.setMap(map);
    })
})();
