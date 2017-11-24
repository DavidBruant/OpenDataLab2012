const dataSources = {
    "1997": './data/Législatives bordeaux 1997.csv',
    "2002": './data/Législatives bordeaux 2002.csv',
    "2004": './data/Législatives bordeaux 2004.csv',
    "2007": './data/Législatives bordeaux 2007.csv'
};

function processCSV(csvData){
    const yearData = {};

    // parsing CSV
    // TODO : add proper CSV parser
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

    return yearData;
}

export default function getElectionData(){
    return Promise.all(
        Object.keys(dataSources).map(y => {
            return fetch(dataSources[y])
            .then(r => r.text())
            .then(processCSV);
        })
    )
    .then(results => {
        const m = new Map();
        Object.keys(dataSources).forEach((y, i) => {
            y = Number(y);
            m.set(y, results[i]);
        })
        return m;
    })
}