
function TopLevel({years, currentYear, electionDataByYear, onYearChanged}){
    const frag = document.createDocumentFragment();
    frag.append(
        YearSelector(years, currentYear, onYearChanged),
        Credits()/*,
        ElectionMap(electionDataByYear.get(currentYear)),
        YearElectionInfos(electionDataByYear.get(currentYear))*/
    )
    return frag;
}

function YearSelector(years, currentYear, onYearChanged){
    const div = document.createElement('div');
    div.classList.add('year-selector');

    years.forEach(y => {
        div.innerHTML += `<button>${y}</button>`;
    });

    return div;
}

function Credits(){
    const div = document.createElement('div');
    div.classList.add('credits');
    div.innerHTML = `<img style="float:left; margin-right:10px;" src="./images/Logo-creative-commons-by-sa.jpg" width="100">
    Data-visualisation effectuée par: David Bruant, Martin Caro, Pierre Garrat, Anthony Jolly et Maxence Kagni.
    <a href="./sources/index.html">Sources de données</a>`

    return div;
}




function ElectionMap(){}
function YearElectionInfos(){}
