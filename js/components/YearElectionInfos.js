'use strict';

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

function YearElectionInfos(currentYear, electionData){
    const div = document.createElement('div');
    div.id = 'infos';

    const leftCandidate = candidatesByYear[currentYear]['gauche'];
    const rightCandidate = candidatesByYear[currentYear]['droite'];

    const yearInfos = computeYearInfos(electionData, currentYear);

    const leftScore = yearInfos[leftCandidate];
    const rightScore = yearInfos[rightCandidate];     

    div.innerHTML = `<div id="currentResult">
        <div id="currentYear" class="chosenYear">${currentYear}</div>
        <div id="context">Résultat complet</div>
        
        <div id="bureauInfos">
            <div id="bureau" class="${rightScore < leftScore ? 'left' : 'right'}">
                Deuxième circonscription de Bordeaux
            </div>
            <div id="leftRight">
                <div id="candidates">
                    <div class="left">${leftCandidate}</div>
                    <div class="right">${rightCandidate}</div>
                </div>
                <div id="scores">
                    <div class="left">${leftScore} %</div>  
                    <div class="right">${rightScore} %</div>
                </div>
            </div>
        </div>
        <div class="otherInfos">
            <span>Inscrits <span class="reg">${yearInfos['Inscrits']}</span></span><br>
            <span>Abstention <span class="abst">${yearInfos['Abst %']} %</span></span>
        </div>
    </div>`;

    /*
    <div id="comparison">
        <div><!-- wrapping div just so that #yearChoice and #progression have a different parent-->
            <div id="yearChoice">
                <span>Comparatif</span>
                <span class="choice chosenYear">1997</span>
                <span class="choice">2002</span>
                <span class="choice">2004</span>
            </div>
        </div>
        
        <div id="progression">
            <span class="from chosenYear">1997</span>
            <span class="arrow left">+4.93%</span>
            <span class="to chosenYear">2007</span>
        </div>
    
        <div class="otherInfos">
            <span class="delta">Inscrits <span class="reg">+9678</span></span><br>
            <span class="delta">Abstention <span class="abst">+6.88%</span></span>
        </div>
    </div>
    */

    return div;


}
