import { fromJS } from 'immutable';

let timeArr = [];
// for (var i = 0; i <= 23; i++) {
//     var nameHr = i;
//     if(i>12) {
//         nameHr = nameHr-12;
//     }
//     if (i===0) {
//         nameHr = 12;
//     }
//
//     var timeLable = (i>11) ? 'PM' : 'AM';
//     for (var j = 0; j <= 59; j = j+30) {
//         let timeObj = {
//             name : String("0" + nameHr).slice(-2)+'.'+String("0" + j).slice(-2)+' '+timeLable,
//             value : String("0" + i).slice(-2)+':'+String("0" + j).slice(-2),
//             title : '',
//             avatar : '/images/clock.png',
//         }
//         timeArr.push(timeObj);
//     }
// }

for (var i = 0; i <= 23; i++) {
    var nameHr = i;
    var end_nameHr = i + 1;
    if(i>12) {
        nameHr = nameHr-12;
    }
    if(end_nameHr>12) {
        end_nameHr = end_nameHr-12;
    }
    if (i===0) {
        nameHr = 12;
    }

    nameHr = nameHr < 10 ? "0"+nameHr : nameHr;
    end_nameHr = end_nameHr < 10 ? "0"+end_nameHr : end_nameHr;

    var timeLable = (i>11) ? 'PM' : 'AM';
    var end_timeLable = (i>11) ? 'PM' : 'AM';
    for (var j = 0; j <= 59; j = j+60) {
        let timeObj = {
            name : nameHr+'.'+String("0" + j).slice(-2)+' '+timeLable + ' - ' + end_nameHr+'.'+String("0" + j).slice(-2)+' '+end_timeLable,
            value : String("0" + i).slice(-2)+':'+String("0" + j).slice(-2),
            end_value : String("0" + Number(i+1)).slice(-2)+':'+String("0" + j).slice(-2),
            title : '',
            avatar : '/images/clock.png',
        }
        timeArr.push(timeObj);
    }
}

const mentions = fromJS(timeArr);
export default mentions;
