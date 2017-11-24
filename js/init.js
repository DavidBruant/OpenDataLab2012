if(!window.google){
    // Mock to avoid throwing when offline
    window.google = {
        maps: {
            LatLng: function(){},
            Polygon: function(){},
            MapTypeId:{},
            Map: function(){},
            event:{
                addListener: function(){}
            }
        }
    };

    window.google.maps.Polygon.prototype = {
        setMap: function(){},
        setOptions: function(){}
    }

}

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
    
})(window);