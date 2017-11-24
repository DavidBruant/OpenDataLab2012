/**
 * TODO :
 * (tech) add redux + re-render logic
 * (tech) make a map implementation that shows text
 * (tech) make the year selector work
 * 
 * (tech) reimplement the side panel
 * 
 * (fun) make the welcome panel a panel on top of the map
 * 
 */

const {createStore} = Redux;

const ELECTION_DATA = 'ELECTION_DATA';

const store = createStore(
    (state, action) => {
        const {type} = action;
        switch(type){
            case ELECTION_DATA: {
                const {electionDataByYear} = action;
                state.electionDataByYear = electionDataByYear;
                return state;
            }
            default: {
                console.warn('unknown action type', type);
                return state;
            }
        }
    },
    {
        years : [1997, 2002, 2004, 2007], 
        currentYear: 2007, 
        electionDataByYear: new Map()
    }
)

store.subscribe(state => {
    console.log('state', store.getState());

    document.body.append(TopLevel(
        Object.assign(
            {onYearChanged: () => console.log('onYearChanged')},
            store.getState()
        )
    ))
})


getElectionData()
.then(electionDataByYear => store.dispatch({type: ELECTION_DATA, electionDataByYear}))





/*



(function(){
    "use strict";
    var SPACE = ' ';
    
    var geomapDefer = new $.Deferred(),
        geomapP = geomapDefer.promise();
    
    var polygonsDefer = new $.Deferred(),
        polygonsP = polygonsDefer.promise();    

    var dataDefer = new $.Deferred(),
        dataP = dataDefer.promise();

    var enquetesDefer = new $.Deferred(),
        enquetesP = enquetesDefer.promise();

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
        
            $('#bureau').text(currentBdv === null ? 'Deuxième circonscription de Gironde' : currentBdv);
            
            $('#bureau').removeClass('right')
                        .removeClass('left')
                        .addClass(rightScore < leftScore ? 'left' : 'right');
            
            $('#candidates .left').text(leftCandidate);
            $('#candidates .right').text(rightCandidate);
            $('#scores .left').text(leftScore + ' %');
            $('#scores .right').text(rightScore + ' %');
            
            $('#currentResult .otherInfos .reg').text(currentData['Inscrits']);
            $('#currentResult .otherInfos .abst').text(currentData['Abst %'] + ' %');
            
        });
    }
    
    var currentlyComparingWith = '1997';
    
    // When either bureau or year changes
    function refreshComparisonData(){
        dataP.then(function(data){
            var before, after;
            if(Number(currentYear) < Number(currentlyComparingWith)){
                 before = currentYear;
                 after = currentlyComparingWith;
            }
            else{
                 before = currentlyComparingWith;
                 after = currentYear;
            }
            
            //console.log(before, after);
            
            var beforeData, afterData;
            if(currentBdv === null){
                // full data;
                beforeData = computeYearInfos(data[before], before);
                afterData = computeYearInfos(data[after], after);
                //console.log('beforeData', beforeData);
                //console.log('afterData', afterData);
            }
            else{
                beforeData = data[before][currentBdv];
                afterData = data[after][currentBdv];
            }
            
            var beforeLeftCandidate = candidatesByYear[before]['gauche'];
            var afterLeftCandidate = candidatesByYear[after]['gauche']; 

            //console.log(beforeLeftCandidate, afterLeftCandidate);
            //console.log(afterData[afterLeftCandidate], beforeData[beforeLeftCandidate]);

            var deltaLeft = Math.round(100*(afterData[afterLeftCandidate] - beforeData[beforeLeftCandidate]))/100;
            $('#progression .arrow')
                .removeClass('left')
                .removeClass('right')
                .text('+'+(deltaLeft < 0 ? -deltaLeft : deltaLeft) +'%')
                .addClass(deltaLeft > 0 ? 'left' : 'right');

            var deltaReg = afterData['Inscrits'] - beforeData['Inscrits'];
            $('#comparison .otherInfos .reg').text(deltaReg > 0 ? '+'+deltaReg : deltaReg);
            
            //console.log(afterData['Abst %'], beforeData['Abst %']);
            var deltaAbst = Math.round(100*(afterData['Abst %'] - beforeData['Abst %']))/100;
            $('#comparison .otherInfos .abst').text( (deltaAbst > 0 ? '+'+deltaAbst : deltaAbst)+'%');

        
        });
    }
    
    var refreshComparison = (function(){
        var years = Object.keys(candidatesByYear);
        var elementsPerYear;
     
        $(function(){
            $('#yearChoice .choice').each(function(i, e){
                $(e).click(function(){
                    currentlyComparingWith = $(e).text();
                    refreshComparison();
                });
            });
        });
        
        return function refreshComparison(){
            // update year choices to be all but the currentYear
            elementsPerYear = {};
            
            $('#yearChoice .choice').each(function(i, e){
                var y = Number(years[i]) >= Number(currentYear) ? years[i+1] : years[i];
                $(e).text(y);
                elementsPerYear[y] = e;
            });
            
            if(currentlyComparingWith === currentYear){
                currentlyComparingWith = (currentlyComparingWith === '1997') ? '2007' : '1997';
            }

            $('#yearChoice .choice').removeClass('chosenYear');
            $(elementsPerYear[currentlyComparingWith]).addClass('chosenYear');
            
            var min, max;
            if(Number(currentYear) < Number(currentlyComparingWith)){
                 min = currentYear;
                 max = currentlyComparingWith;
            }
            else{
                 min = currentlyComparingWith;
                 max = currentYear;
            }
            
            $('#progression .from').text(min);
            $('#progression .to').text(max);
            
            refreshComparisonData();
        };
        
    })();



    $(function(){
        var on = false;

        $('button.enquete').click(function(){
            console.log('changing state to', !on);
            if(on)
                $('.enquete-panel').hide();
            else
                $('.enquete-panel').show();

            on = !on;
        });
    });

    function refreshEnqueteData(){
        enquetesP.then(function(enquetes){
            if(currentBdv in enquetes){
                $('button.enquete').show();
                $('.enquete-panel').empty().append(enquetes[currentBdv])
            }
            else{
                $('button.enquete').hide();
            }
        });
    }

    function displayCurrentYearMap(){
        $.when(dataP, polygonsP).then(function(data, polygons){
            var yearData = data[currentYear];
            var candidates = candidatesByYear[currentYear];
            
            //console.log("yearData", yearData);

            $("#currentYear").text(currentYear);
            
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
            refreshComparisonData();
            refreshEnqueteData();
        }
    }
    
    function changeYear(year){
        //console.log('Changing year to', year);
        currentYear = year;
        refreshInfos(); // refresh infos first as the map may take longer to refresh
        displayCurrentYearMap();
        refreshComparison();
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
                
        var leftCandidate = candidatesByYear[year]['gauche'];
        var rightCandidate = candidatesByYear[year]['droite'];

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
                    if(currentBdv === bdvName)
                        changeBdv(null);
                    else
                        changeBdv(bdvName);
                });
                
                polygons[bdvName] = pol;
            });
            polygonsDefer.resolve(polygons);
            //console.log("Polygon keys", Object.keys(polygons));
        });
    })();
    
    
    // DATA
    


    
    // Create an object key-ed on bdv which contains enquetes.
    // On bdv change, check if there is an enquête, display the "info" button (hide if not)
    // When clicked, highlight all bdvs and display the enquete


    $(function(){
        var enquetes = {};

        $(".enquete[data-bdvs]").each(function(i, e){
            $(e).remove(); // will append to something else

            $(e).data("bdvs").split('/') // '/'-separation is a convention
                .forEach(function(bdv){
                    enquetes[bdv] = e;
                });

            enquetesDefer.resolve(enquetes);
        });

    });

    $.when(enquetesP, polygonsP).then(function(enquetes, polygons){
        var enqKeys = Object.keys(enquetes);
        var polygonKeys = Object.keys(polygons);

        enqKeys.forEach(function(bdv){
            if(!(bdv in polygons))
                console.log(bdv, 'not in data')

        });


    });

    // Enquêtes
    $(function(){
        $('#enquête').click(function(){
        
        })
    
    });
    
    
    $.when(geomapP, polygonsP).then(function(geomap, polygons){
        Object.keys(polygons).forEach(function(bdv){
            var pol = polygons[bdv];
            pol.setMap(geomap);
        });
    });
    
    
})();


$(function(){
    var welcome = $("#welcome");
    welcome.find('button').click(function(){
        welcome.fadeOut('1000', function(){ this.remove(); });
    })

}
*/