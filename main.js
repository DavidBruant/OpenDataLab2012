
(function(){
    "use strict";
    var DOUBLE_QUOTE = '"';
    
    String.prototype.unquote = function(){
        if(this[0] === DOUBLE_QUOTE && this[this.length-1] === DOUBLE_QUOTE){
            return this.substring(1, this.length-1);
        }
        if(this[0] !== DOUBLE_QUOTE && this[this.length-1] !== DOUBLE_QUOTE){
            return this;
        }
        
        console.warn("unhandled case", this);
    };

})();


(function(){
    "use strict";
    var geomap;
    var data = Object.create(null); // TODO shim (+forEach, + map)

    $(function initialize() {
        var myOptions = {
            center: new google.maps.LatLng(44.84, -0.6),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        geomap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    });
    
    $(function(){
        var kmllayer = new google.maps.KmlLayer('http://davidbruant.github.com/OpenDataLab2012/BDVBDX.kml', {
            map: geomap,
            //suppressInfoWindows: true | false, // Suppress the rendering of info windows when layer features are clicked.
            clickable: true
        });
        
        google.maps.event.addListener(kmllayer, 'status_changed', function(){
            console.log('status changed event');
            console.log('new status', kmllayer.getStatus());
            //console.log(Object.keys(kmllayer));
        })

        console.log('kmllayer status', kmllayer.getStatus());
    });
    
    var csvDataP = $.ajax({
        url:'./Législatives bordeaux.csv',
        dataType: "text"
    });
    csvDataP.fail(function(csvError){
        console.log('CSV Error', csvError);
    });
        
    csvDataP.then(function(csvData){
        console.log('CSV retrieved');
        // parsing CSV
        var lines = csvData.split('\n');
        lines.forEach(function(l, i){
            lines[i] = lines[i].split(';');

            // removing freaking quote
            lines[i].forEach(function(e, j){
                lines[i][j] = e.unquote() || lines[i][j];
            });
        });
        
        var firstLine = lines.shift();
        
        console.log(firstLine);
        console.log(lines.slice(0,3));
        
        var dataArray = lines.map(function(l){
            var d = {};
            
            l.forEach(function(val, i){
                d[firstLine[i]] = val;
            });
            
            return d;
        });
        
        console.log(dataArray);
        
        dataArray.forEach(function(e){
            var key = e.section + ' ' + e['Bur.'];
        
        })
        
    });

    
    
})();

