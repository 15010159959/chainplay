"use strict";

var target_date = new Date().getTime() + 24 * 3600 * 1000;
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
var defaultAccount = Account.NewAccount().getAddressString();
var keepSixFloat = function (v) {
    return parseInt(v * 1000000) / 1000000;
}
$(function () {

    // 增加key
    $("#add1").click(function () {
        $("#account").val(parseInt($("#account").val()) + 1);
    })
    $("#add2").click(function () {
        $("#account").val(parseInt($("#account").val()) + 2);
    })
    $("#add5").click(function () {
        $("#account").val(parseInt($("#account").val()) + 5);
    })
    $("#add10").click(function () {
        $("#account").val(parseInt($("#account").val()) + 10);
    })
    $("#add100").click(function () {
        $("#account").val(parseInt($("#account").val()) + 100);
    })
    $("#clear").click(function () {
        $("#account").val(0);
    })

    // 显示 关闭 简介规则玩法
    $("#showIntroduction").click(function () {
        $(".introduction").removeClass("hide");
    })

    $(".icon").click(function () {
        $(".introduction").removeClass("hide");
    })

    $(".clear").click(function () {
        $(".introduction").addClass("hide");
    })

});



//     $("#noExtension").removeClass("hide")
// }else{
//     $("#search_value").attr("disabled",false)
//     $("#search").attr("disabled",false)
// }
var dappAddress = "n1tmnQK51BU2uFeQgM4XUuD35PErFvHo8Nd";
//here we use neb.js to call the "get" function to search from the Dictionary
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

var accountWallet;

// 页面加载时请求数据
$().ready(function () {

    
    //to check if the extension is installed
    //if the extension is installed, var "webExtensionWallet" will be injected in to web page
    if (typeof (webExtensionWallet) === "undefined") {
        alert("Extension wallet is not installed, please install it first.")
    }else{
        NasExtWallet.getUserAddress(function (addr) {
            accountWallet = addr;
            console.log("user address is : " + addr)
        }) 
    }

    

    setTimeout(function(){
        if (typeof(NasExtWallet) !== "undefined"){
            NasExtWallet.getUserAddress(function (addr) {
                accountWallet = addr;
                console.log("user address is : " + addr)
            })   
        } 
    }, 1000)
    
    // $("#search_value").val() 搜索框内的值
    $(".modal.loading").modal("show");
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getInfo";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var arg = ''
    var callArgs = JSON.stringify([arg]); //推荐用 JSON.stringify 来生成参数字符串,这样会避免出错!
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    neb.api.call(accountWallet ? accountWallet : defaultAccount, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        cbSearch(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })
})
//return of search,
function cbSearch(resp) {
    var result = JSON.parse(resp.result); ////resp is an object, resp.result is a JSON string
    // console.log("return of rpc call: " + JSON.stringify(result))
    console.log(result);
    // var resultString = JSON.stringify(result);
    $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
    $("#keyCountOfAddress").text(result.keyCountOfAddress);
    $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
    $("#keyPrice").text("@" + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
    $("#price").text(result.keyPrice / 1000000000000000000);
    console.log("====", result.keyPrice);
    $(".modal.loading").modal("hide");


    // 倒计时

    target_date = result.deadline; // set the countdown date
    var days, hours, minutes, seconds; // variables for time units

    var countdown = document.getElementById("tiles"); // get tag element

    getCountdown();

    setInterval(getCountdown, 1000);
    setInterval(call_info, 10000);

    function call_info() {
        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getInfo";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var arg = ''
        var callArgs = JSON.stringify([arg]); //推荐用 JSON.stringify 来生成参数字符串,这样会避免出错!
        var contract = {
            "function": callFunction,
            "args": callArgs
        }
        neb.api.call(accountWallet ? accountWallet : defaultAccount, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            // cbSearch(resp)
            var result = JSON.parse(resp.result);
            $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
            $("#keyCountOfAddress").text(result.keyCountOfAddress);
            $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
            $("#keyPrice").text("@" + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
            $("#price").text(result.keyPrice / 1000000000000000000);
            target_date = result.deadline;

        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
    }

    function getCountdown() {

        // find the amount of "seconds" between now and target
        var current_date = new Date().getTime();
        var seconds_left = (target_date - current_date) / 1000;
        if (seconds_left <= 0) {
            hours = 0;
            minutes = 0;
            seconds = 0;
        } else {

            days = pad(parseInt(seconds_left / 86400));
            seconds_left = seconds_left % 86400;

            hours = pad(parseInt(seconds_left / 3600));
            seconds_left = seconds_left % 3600;

            minutes = pad(parseInt(seconds_left / 60));
            seconds = pad(parseInt(seconds_left % 60));
        }
        // format countdown string + set tag value
        countdown.innerHTML = "<span>" + hours + "</span><span>" + minutes + "</span><span>" + seconds + "</span>";
    }

    function pad(n) {
        return (n < 10 ? '0' : '') + n;
    }

}
// 交易NAS
// $("#add").click(function() {
//     $(".result_faile").addClass("hide");
//     $(".add_banner").removeClass("hide");
//     $("#add_value").val("")
// })
var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var serialNumber
//var callbackUrl = NebPay.config.mainnetUrl;   //如果合约在主网,则使用这个
var callbackUrl = NebPay.config.testnetUrl; //

// 购买key
$("#buy").click(function () {
    clearInterval(intervalQuery);
    $(".modal.loading").modal("show");
    //console.log("clear intervalQuery=" + intervalQuery)
    var to = dappAddress;
    var value = $('#price').text() * $("#account").val();
    var callFunction = "buyKey"
    var callArgs = "[]"
    var arg = ""
    // var callArgs = JSON.stringify(arg);
    serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
        listener: cbPush, //设置listener, 处理交易返回信息
        callback: callbackUrl
    });
    intervalQuery = setInterval(function () {
        //console.log("querying intervalQuery=" + intervalQuery)
        funcIntervalQuery();
    }, 6000);
});

//  领取分红奖励

// $("#getBouns").click(function () {
//     clearInterval(intervalQuery);
//     //console.log("clear intervalQuery=" + intervalQuery)
//     var to = dappAddress;
//     var value =  "0";;
//     var callFunction = "getBouns"
//     var callArgs = "[]"
//     var arg = ""
//     // var callArgs = JSON.stringify(arg);
//     serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
//         listener: callPush,       //设置listener, 处理交易返回信息
//         callback: callbackUrl
//     });
//     intervalQuery = setInterval(function () {
//         //console.log("querying intervalQuery=" + intervalQuery)
//         funcIntervalQuery();
//     }, 6000);
// });

var intervalQuery

function funcIntervalQuery() {
    var options = {
        callback: callbackUrl
    }
    nebPay.queryPayInfo(serialNumber, options) //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp) //resp is a JSON string
            var respObject = JSON.parse(resp);
            $(".modal.loading").modal("hide");
            console.log(respObject);
            if (respObject.code === 0 && respObject.data.status !== 2) {
                clearInterval(intervalQuery);
                //console.log("clear intervalQuery=" + intervalQuery)
                if (respObject.data.status === 1) {
                    var execute_result = JSON.parse(respObject.data.execute_result);
                    alert(" successfully! you bought " + execute_result.amount + " keys, " + execute_result.price / 1000000000000000000 + " nas");
                    // location.reload() ;  刷新页面

                    // 再次请求 购买成功之后的数据
                    accountWallet = respObject.data.from;
                    var value = "0";
                    var nonce = "0"
                    var gas_price = "1000000"
                    var gas_limit = "2000000"
                    var callFunction = "getInfo";
                    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
                    var arg = ''
                    var callArgs = JSON.stringify([arg]); //推荐用 JSON.stringify 来生成参数字符串,这样会避免出错!
                    var contract = {
                        "function": callFunction,
                        "args": callArgs
                    }
                    neb.api.call(accountWallet, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                        // cbSearch(resp)
                        var result = JSON.parse(resp.result);
                        $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
                        $("#keyCountOfAddress").text(result.keyCountOfAddress);
                        $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
                        $("#keyPrice").text("@" + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
                        $("#price").text(result.keyPrice / 1000000000000000000);
                        target_date = result.deadline;

                    }).catch(function (err) {
                        //cbSearch(err)
                        console.log("error:" + err.message)
                    })
                } else if (respObject.data.status === 0) {
                    alert(respObject.data.execute_error);
                }
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

function cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
    var respString = JSON.stringify(resp);
    if (respString.search("rejected by user") !== -1) {
        clearInterval(intervalQuery)
        alert(respString)
    } else if (respString.search("txhash") !== -1) {
        //alert("wait for tx result: " + resp.txhash)
    }
}

// function callPush(resp) {
//     console.log("response of push: " + JSON.stringify(resp))
//     var respString = JSON.stringify(resp);
//     if (respString.search("rejected by user") !== -1) {
//         clearInterval(intervalQuery)
//         alert(respString)
//     } else if (respString.search("txhash") !== -1) {
//         //alert("wait for tx result: " + resp.txhash)
//     }
// }