let query_g;

$('#form-action').on('submit', () => {
    const form = $('#form-action');
    //alert('|'+form.serialize()+'|');
    $.ajax({
        url: "/game",
        method: "POST",
        data: form.serialize(),
        success: (data) => {
            window.location.href = '/game_main';
        }
    });
    return false;
});
$(document).ready(function(){
    begin();
});
const begin = () => {
    getaction();
    //setTimeout(function(){getaction();}, 5000);
    //query_g = setInterval('getaction()',2000);
}
const getaction = () => {
    $.ajax({
        url: "/game_action",
        method: "GET",
        dataType: "json",
        data: {"accessToken": "<%=accessToken%>", "gameToken": "<%=gameToken%>"},
        statusCode: {
            200: (data) => container(data),
            403: (jqXHR) => {
                const error = JSON.parse(jqXHR.responseText);
                $('.error', form).html(error.message);
            }
        }

    });
};
const postaction = (data) => {
    clearInterval(query_g);

    $.ajax({
        url: "/game_action",
        method: "POST",
        dataType: "json",
        data: {"accessToken": "<%=accessToken%>", "gameToken": "<%=gameToken%>", "row": data[0], "col": data[1]},
        statusCode: {
            200: (data) => begin(),
            403: (jqXHR) => {
                const error = JSON.parse(jqXHR.responseText);
                $('.error', form).html(error.message);
            }
        }

    });
};
const container = (list) => {
    switch(list.state){
        case 0:{
            board(list, 0);
            $('#user1').html("<%=user.get('username')%>");
            $('#div_owner').removeClass("border-bottom border-dark");//border-bottom border-dark invisible
            $('#div_opponent').removeClass("border-bottom border-dark");
            $('#div_opponent').addClass("invisible");
        } break;
        case 1:{
            const dor = '<%=accessToken%>';
            if(dor==''){
                $('#block_div').addClass('block_div');
                board(list, 1, true);
            }
            else{
                $('#block_div').removeClass('block_div');
                board(list, 1);
            }
            if(list.turn=="owner") $('#div_owner').addClass("border-bottom border-dark");
            else $('#div_opponent').addClass("border-bottom border-dark");
            $('#div_time').html(`<h4>${time(list.gameDuration)}</h4>`);
            $('#user1').html(list.owner);
            $('#user2').html(list.opponent);
            $('#div_opponent').removeClass("invisible");
        } break;
        case 2:{
            clearInterval(query_g);
            const winner = (list.gameResult=="owner"?list.owner:list.gameResult=="opponent"?list.opponent:'Ничья');
            $('#div_winner').html(`<span>Победитель партии: ${winner}</span>`);
            board(list, 2);
            $('#div_time').html(`<h4>${time(list.gameDuration)}</h4>`);
            $('#user1').html(list.owner);
            $('#user2').html(list.opponent);
            $('#div_owner').removeClass("border-bottom border-dark");
            $('#div_opponent').removeClass("border-bottom border-dark");
            $('#div_opponent').removeClass("invisible");
        } break;
    }
};
const board = (data, type, watcher = false) => {
    const gamer = "<%=gamer%>";
    let tmp;
    switch(type) {
        case 0:{
            $('button').html(`CLOSE`);
        } break;
        case 1:{
            if(watcher) $('button').html(`BACK`);
            else $('button').html(`SURRENDER`);
        } break;
        case 2:{
            $('button').html(`BACK`);
        } break;
    }
    for (let i = 0; i < data.field.length; i++) {
        tmp = data.field[i];
        //alert(`${i}|${typeof(tmp)}|${tmp}|${tmp.length}`);
        for (let j = 0; j < tmp.length; j++) {
            $(`#div_${i + 1}${j + 1}`).removeClass('div_n_n div_n div_o div_x');

            if(type == 0) $(`#div_${i + 1}${j + 1}`).addClass(`div_n_${tmp[j]}`);
            else {
                if(watcher&&tmp[j]=='n'||tmp[j]=='n'&&gamer!=data.turn) $(`#div_${i + 1}${j + 1}`).addClass(`div_n_${tmp[j]}`);
                else $(`#div_${i + 1}${j + 1}`).addClass(`div_${tmp[j]}`);
            }
            $(`#div_${i + 1}${j + 1}`).off();
            if(type == 1) if($(`#div_${i + 1}${j + 1}`).hasClass('div_n')) $(`#div_${i + 1}${j + 1}`).on('click', function() {
                const str = this.id.split('_')[1];
                postaction(str);
            });
        }
    }
};
const time = (millisec=null) => {
    let seconds = (millisec / 1000).toFixed(0);
    let minutes = Math.floor(seconds / 60);
    let hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}