
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
    var SPACE = ' ';
    
    var geomapDefer = new $.Deferred();
    var geomapP = geomapDefer.promise(),
        polygonsP,
        dataP;
    
    var infos;

    var currentYear = 2007;
    
    var candidatesByYear = {
        "1997": {
            gauche: "Savary (PS)",
            droite: "Juppé (RPR)"
        },
        "2002": {
            gauche: "Paoletti (PS)",
            droite: "Juppé (UMP)"
        },
        "2004": {
            gauche: "Delaunay (PS)",
            droite: "Martin (UMP)"
        },
        "2007": {
            gauche: "Delaunay (PS)",
            droite: "Juppé (UMP)"
        }
    }

    function displayCurrentYear(){
        $.when(dataP, polygonsP).then(function(data, polygons){
            var yearData = data[currentYear];
            var candidates = candidatesByYear[currentYear];
            
            Object.keys(polygons).forEach(function(bdv){
                var pol = polygons[bdv];
                var d = yearData[bdv];
            
                if(d){
                    pol.setOptions({
                        fillColor: d[candidates.gauche] < d[candidates.droite] ? 'blue' : 'red'
                    });
                }
                else{ // error case
                    console.warn('Bureau de vote inconnu', bdv);
                }
            });
        });
    }


    $(function initialize() {
        var myOptions = {
            center: new google.maps.LatLng(44.84, -0.57),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var geomap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        geomapDefer.resolve(geomap);
        
        infos = $('#infos');
        
        $('button.year').click(function(e){
            currentYear = $(e.target).attr('data-year');
            $("#infos > .currentYear").text(currentYear);
            
            displayCurrentYear();
        });
        
        // Init
        displayCurrentYear();
        
    });
    
    // POLYGONS
    polygonsP = (function KMLTreatment(){
        var polygonsDefer = new $.Deferred();
    
        var kmlP = $.get('./BDVBDX.kml').then(function(kml){
            console.log("KML retrieved");
            var polygons = Object.create(null);
            
            var placemarks = $(kml).find('Folder Placemark');
            
            var polPs = [];
            
            placemarks.each(function(i, e){
                var bdvName = $(e).find('name').text();
                
                var polygonCoordsStr = $(e).find('Polygon coordinates').text().trim(); // TODO compat: trim
                var polygonCoords = polygonCoordsStr.split(SPACE);
                //console.log('polygonCoords', polygonCoords)
                
                var polygonPath = polygonCoords.map(function(e, i){
                    var coords = e.split(',').slice(0, 2);
                    // Careful with long/lat order. google.maps.LatLng expects it in reverse KML order
                    var latlng = new google.maps.LatLng( parseFloat(coords[1]) , parseFloat(coords[0]) );
                    
                    return latlng;
                });
                

                var pol = new google.maps.Polygon({
                    paths : polygonPath,

                    fillOpacity: 0.5,
                    fillColor: 'white',

                    strokeColor : 'grey',
                    strokeWeight: 1
                });
                
                polygons[bdvName] = pol;
            });
            polygonsDefer.resolve(polygons);
            //console.log("Polygon keys", Object.keys(polygons));
        });
        
        return polygonsDefer.promise();
    })();
    
    
    // DATA
    dataP = (function(){
        var dataDefer = new $.Deferred();
        var data = Object.create(null); // TODO shim (+forEach, + map)
        
        var dataSources = {
            "1997": './data/Législatives bordeaux 1997.csv',
            "2002": './data/Législatives bordeaux 2002.csv',
            "2004": './data/Législatives bordeaux 2004.csv',
            "2007": './data/Législatives bordeaux 2007.csv'
        };
        
        var dataDefers = Object.keys(dataSources).map(function(){return new $.Deferred();});
        var dataPs = dataDefers.map(function(def){return def.promise();});
        
        Object.keys(dataSources).forEach(function(year, i){
            var url = dataSources[year];
        
            var yearData = data[year] = Object.create(null);
            
            $.ajax({
                url: url,
                dataType: "text"
            }).then(function(csvData){
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
                //console.log("firstLine", firstLine);
                
                var dataArray = lines.map(function(l){
                    var d = {};
                    
                    l.forEach(function(val, i){
                        var key = firstLine[i];
                        
                        switch(key){
                            case "Inscrits":
                                val = parseInt(val);
                                break;
                            case "Abst %":
                            case "Delaunay (PS)":
                            case "Juppé (UMP)":
                                val = parseFloat(val);
                                break;
                        }
                    
                        d[key] = val;
                    });
                    
                    return d;
                });
                
                dataArray.forEach(function(e, i){
                    var key = e.Nom;
                    if(!key || key === 'Total')
                        return;

                    yearData[key] = e;
                });

                dataDefers[i].resolve();
            });
        });
    
        $.when(dataPs).then(function(){
            dataDefer.resolve(data);
        })
    
        return dataDefer.promise();
    })();
    
    
    $.when(geomapP, polygonsP).then(function(geomap, polygons){
        Object.keys(polygons).forEach(function(bdv){
            var pol = polygons[bdv];
            pol.setMap(geomap);
        });
    });
    
    
})();

