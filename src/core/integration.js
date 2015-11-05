/**
 * Created by acastillo on 9/17/15.
 */

define(function(){
    function integration(signals, sum){
        var integral = 0;
        var signals2 = signals;
        for(var j=0;j<signals.length;j++){
            integral+=signals2[j].integralData.value;
        }
        //Ajusting the integral and reduce the lenght of the numbers
        for(var j=0;j<signals.length;j++){
            signals2[j].integralData.value=Math.round(signals2[j].integralData.value*sum/integral);
        }

        signals2.sort(function(a,b){
            return a.integralData.value<b.integralData.value?1:-1;
        });

        var j = signals.length-1;
        while(signals2[j].integralData.value<0.5&&j>=0){
            signals2.splice(j,1);
            j--;
        }

        return signals2;
    }

    return integration;
});
