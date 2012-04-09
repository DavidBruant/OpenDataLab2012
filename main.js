/*
TODO:
* Comparatif entre l'année courante et les autres années (en bas à droite)
* Page d'accueil
* Intégration des données 

* Camenbert (batons)

*/



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


(function(global){

    global.bdvColor = function(winningSide, percentage){
        // HSL are far easier to figure out for color scales
        var H = winningSide === 'droite' ? 225 : 356 ;
        var S = 0.9;
        var L = (150 - percentage - 25)/100; 
        
        // console.log("light", L);
        
        // Computing RGB for compat http://en.wikipedia.org/wiki/HSL_and_HSV
        var C = (1 - Math.abs(2*L -1))*S;
        var Hp = H/60;
        var X = C*(1 - Math.abs(Hp%2 -1));
        
        var R1, G1, B1;
        switch(Math.floor(Hp)){
            case 0:
                R1 = C; G1 = X; B1 = 0;
                break;
            case 1:
                R1 = X; G1 = C; B1 = 0;
                break;
            case 2:
                R1 = 0; G1 = C; B1 = X;
                break;
            case 3:
                R1 = 0; G1 = X; B1 = C;
                break;
            case 4:
                R1 = X; G1 = 0; B1 = C;
                break;
            case 5:
                R1 = C; G1 = 0; B1 = X;
                break;
        }
        
        var m = L - C/2;
        
        var R = Math.floor(360*(R1 + m));
        var G = Math.floor(360*(G1 + m));
        var B = Math.floor(360*(B1 + m));
        
        var ret = 'rgb('+[R,G,B].join(',')+')'
        // console.log('color', ret);
        return ret;
    };
    
})(this);


(function(){
    "use strict";
    var SPACE = ' ';
    
    var geomapDefer = new $.Deferred(),
        geomapP = geomapDefer.promise();
    
    var polygonsDefer = new $.Deferred(),
        polygonsP = polygonsDefer.promise();    

    var dataDefer = new $.Deferred(),
        dataP = dataDefer.promise();

    var currentYear;
    var currentBdv;
    
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
    
    function refreshInfos(){
        dataP.then(function(data){
            console.log('data are ready, refresh', data);
            var leftCandidate = candidatesByYear[currentYear]['gauche'];
            var rightCandidate = candidatesByYear[currentYear]['droite'];

            var currentData = currentBdv === null ?
                computeYearInfos(data[currentYear], currentYear) :
                data[currentYear][currentBdv];
            
            //console.log('currentBdv', currentBdv);
            
            //console.log('currentData', currentData);
            
            $('#context').text(currentBdv === null ? 'Résultat complet' : 'Bureau de vote');
            
            var rightScore = currentData[rightCandidate];
            var leftScore = currentData[leftCandidate];
        
            $('#bureau').text(currentBdv === null ? 'Ville de Bordeaux' : currentBdv);
            
            $('#bureau').removeClass('right')
                        .removeClass('left')
                        .addClass(rightScore < leftScore ? 'left' : 'right');
            
            $('#candidates .left').text(leftCandidate);
            $('#candidates .right').text(rightCandidate);
            $('#scores .left').text(leftScore + ' %');
            $('#scores .right').text(rightScore + ' %');
            
            $('#otherInfos #reg').text(currentData['Inscrits']);
            $('#otherInfos #abst').text(currentData['Abst %'] + ' %');
            
        });
    }
    

    function displayCurrentYearMap(){
        $.when(dataP, polygonsP).then(function(data, polygons){
            var yearData = data[currentYear];
            var candidates = candidatesByYear[currentYear];
            
            //console.log("yearData", yearData);

            $("#currentYear").text(currentYear);
            // TODO: change this into something less brutal
            //$('#bureauInfos').text('');
            
            Object.keys(polygons).forEach(function(bdv){
                var pol = polygons[bdv];
                var d = yearData[bdv];
                
                if(d){
                    pol.setOptions({
                        fillColor: d[candidates.gauche] < d[candidates.droite] ?
                            bdvColor('droite', d[candidates.droite]) : 
                            bdvColor('gauche', d[candidates.gauche])
                    });
                }
                else{ // error case
                    console.warn('Bureau de vote inconnu', bdv);
                }
            });
            
        });
    }
    
    function changeBdv(newBdv){
        var oldBdv = currentBdv;
        
        if(newBdv !== oldBdv){
            console.log('Changing bdv to', newBdv);

            polygonsP.then(function(polygons){
                if(oldBdv !== null){
                    polygons[oldBdv].setOptions({
                        strokeColor : 'black',
                        strokeWeight: 1,
                        zIndex: 1
                    });
                }
                
                if(newBdv !== null){
                    polygons[newBdv].setOptions({
                        strokeColor : '#FFD700',
                        strokeWeight: 4,
                        zIndex: 2
                    });
                }
            });

            currentBdv = newBdv;
            refreshInfos();
        }
    }
    
    function changeYear(year){
        //console.log('Changing year to', year);
        currentYear = year;
        refreshInfos(); // refresh infos first as the map may take longer to refresh
        displayCurrentYearMap();
    }


    function computeYearInfos(yearData, year){
        var leftCandidate = candidatesByYear[year]['gauche'];
        var rightCandidate = candidatesByYear[year]['droite'];
            
        var totalRegistered = 0;
        var totalAbstentionists = 0;
        var totalRightVotes = 0;
        var totalLeftVotes = 0;
        var totalBlankVotes = 0;
        
        Object.keys(yearData).forEach(function(bdv){
            var currentData = yearData[bdv];
            
            var registered = currentData['Inscrits'];
            var abstentionists = registered*currentData['Abst %']/100; // keeping division approx
            var voters = registered - abstentionists;
            var blanks = currentData['Nuls'];
            var nonBlankVoters = voters - blanks; 
            
            totalRegistered += registered;
            totalAbstentionists += abstentionists;
            totalRightVotes += nonBlankVoters*currentData[rightCandidate]/100;
            totalLeftVotes += nonBlankVoters*currentData[leftCandidate]/100;
            totalBlankVotes += blanks;
        });
        
        var result = {
            'Inscrits' : totalRegistered,
            'Abst %' : Math.round(10000*totalAbstentionists/totalRegistered)/100,
            totalBlankVotes : totalBlankVotes
        };
                
        var leftCandidate = candidatesByYear[currentYear]['gauche'];
        var rightCandidate = candidatesByYear[currentYear]['droite'];

        var totalNonBlankVoters = totalRegistered - totalAbstentionists - totalBlankVotes;

        result[leftCandidate] = Math.round(10000*Math.round(totalLeftVotes)/totalNonBlankVoters)/100;
        result[rightCandidate] = Math.round(10000*Math.round(totalRightVotes)/totalNonBlankVoters)/100;
        
        
        return result;
    }
    
    
    $(function initialize() {
        var myOptions = {
            center: new google.maps.LatLng(44.84, -0.57), // Bordeaux
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var geomap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        google.maps.event.addListener(geomap, 'click', function(){
            changeBdv(null);
        });
        
        geomapDefer.resolve(geomap);
        
        $('.year').click(function(e){
            var target = $(e.target);
            var oldYear = currentYear;
            
            changeYear(target.attr('data-year'));
            if(oldYear){
                $('.year[data-year="'+oldYear+'"]').css('border-color', 'black');
            }
            
            target.css('border-color', '#FFD700');
        });
        
        // Init
        currentBdv = null;
        $('.year[data-year="2007"]').click();
    });
    
    // POLYGONS
    (function KMLTreatment(){
        var kmlP = $.get('./BDVBDX.kml').then(function(kml){
            //console.log("KML retrieved");
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

                    strokeColor : 'black',
                    strokeWeight: 1,
                    zIndex: 1
                });
                
                google.maps.event.addListener(pol, 'click', function(){
                    changeBdv(bdvName);
                });
                
                polygons[bdvName] = pol;
            });
            polygonsDefer.resolve(polygons);
            //console.log("Polygon keys", Object.keys(polygons));
        });
    })();
    
    
    // DATA
    (function(){
        var data = Object.create(null); // TODO shim (+forEach, + map)
        
        var dataSources = {
            "1997": './data/Législatives bordeaux 1997.csv',
            "2002": './data/Législatives bordeaux 2002.csv',
            "2004": './data/Législatives bordeaux 2004.csv',
            "2007": './data/Législatives bordeaux 2007.csv'
        };
        
        var dataDefers = Object.keys(dataSources).map(function(){return new $.Deferred();});
        var dataPs = dataDefers.map(function(def){return def.promise();});
        
        $.when(dataPs).then(function(){
            console.log('all dataPs', data);
            dataDefer.resolve(data);
        });
        
        //console.log(dataPs.length);
        
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
                            case "Nuls":
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
    

    
    })();
    
    
    $.when(geomapP, polygonsP).then(function(geomap, polygons){
        Object.keys(polygons).forEach(function(bdv){
            var pol = polygons[bdv];
            pol.setMap(geomap);
        });
    });
    
    
})();

