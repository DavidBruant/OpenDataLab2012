'use strict';

function TopLevel({years, currentYear, electionDataByYear, onYearChanged}){
    const frag = document.createDocumentFragment();
    console.log('selected', currentYear)

    frag.append(
        YearSelector(years, currentYear, onYearChanged),
        Credits(),
        ElectionMap(electionDataByYear.get(currentYear)),
        YearElectionInfos(currentYear, electionDataByYear.get(currentYear))
    )
    return frag;
}

function YearSelector(years, currentYear, onYearChanged){
    const div = document.createElement('div');
    div.classList.add('year-selector');

    years.forEach(y => {
        const button = document.createElement('button');
        button.append(y);
        if(y === currentYear){
            button.classList.add('selected');
        } 

        button.addEventListener('click', e => { onYearChanged(y) })

        div.append(button);
    });

    return div;
}

function Credits(){
    const div = document.createElement('div');
    div.classList.add('credits');
    div.innerHTML = `<img style="float:left; margin-right:10px;" src="./images/Logo-creative-commons-by-sa.jpg" width="100">
    Data-visualisation effectuée par: David Bruant, Martin Caro, Pierre Garrat, Anthony Jolly et Maxence Kagni.
    <a href="./sources/index.html">Sources de données</a>`;

    return div;
}

function ElectionMap(electionData){
    const div = document.createElement('div');
    div.classList.add('map-container');
    div.innerHTML = '<pre>'+JSON.stringify(electionData, null, 3)+'</pre>';

    return div;
}
