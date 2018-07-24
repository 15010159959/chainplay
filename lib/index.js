"use strict";

var language = window.location.href.indexOf("en") > 0 ? 'en' : 'zh';

var target_date = new Date().getTime() + 24 * 3600 * 1000;
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
var defaultAccount = Account.NewAccount().getAddressString();
var keepSixFloat = function (v) {
    return parseInt(v * 1000000) / 1000000;
}

var days, hours, minutes, seconds; // variables for time units

var countdown = document.getElementById("tiles"); // get tag element

var browser = {
    versions: function () {
        var u = navigator.userAgent,
            app = navigator.appVersion;
        return { //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信   
            qq: u.match(/\sQQ/i) !== null //u.indexOf("MQQBrowser")>-1  //是否QQ 
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
}

$(function () {

    // 增加key
    $("#add1").click(function () {
        $("#account").val(parseInt($("#account").val()) + 1);
        // $("#buy").val( $("#account").val() * $("#keyPrice").val() );
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

    $("#exit").click(function () {
        $("#msg").addClass("hide");
    })

});

var dappAddress = "n1v8XdiWUAXzkYygQnxioeq6xRQr7X8DQdj";
//here we use neb.js to call the "get" function to search from the Dictionary
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://www.chainplay.io"));

var accountWallet;

// 页面加载时请求数据
$().ready(function () {

    accountWallet = $.cookie("accountWallet");

    accountWallet = accountWallet && accountWallet.length == 35?accountWallet:'';

    setTimeout(function () {
        //to check if the extension is installed
        //if the extension is installed, var "webExtensionWallet" will be injected in to web page
        if (browser.versions.mobile) {

        } else {
            if (typeof (webExtensionWallet) === "undefined") {
                // alert("Extension wallet is not installed, please install it first.")
                // 提示信息
                var tip = language == 'zh' ? '温馨提示' : 'Tips';

                var msg = language == 'zh' ? '转化兽是基于星云链的一款应用，需要依赖星云chrome钱包插件，安装地址' : 'Melo the Converter is an application based on the nebula chain, you need to rely on the nebula chrome wallet plugin, install the address';
                $("#title").text(tip);
                $("#msg").removeClass("hide");

                $(".message").html(msg + ":<a target='_blank' href='https://chrome.google.com/webstore/detail/nasextwallet/gehjkhmhclgnkkhpfamakecfgakkfkco'>Chrome Web Store</a>");

                // alert("Extension wallet is not installed, please install it first.")
            } else {

                NasExtWallet.getUserAddress(function (addr) {
                    accountWallet = accountWallet ? accountWallet : addr;
                    console.log("user address is : " + addr + " accountWallet:"+accountWallet)

                    call_info();
                })
            }
        }
    }, 2000)

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
        console.log("call error:" + err.message)
        $("#loading").modal("hide");

        setInterval(call_info, 20000);

        call_info();
        setTimeout(function(){
            getCountdown();
            setInterval(getCountdown, 1000);
        }, 5000)
    })
})

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
        var result = JSON.parse(resp.result);
        $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
        $("#keyCountOfAddress").text(result.keyCountOfAddress);
        $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
        $("#unbonus").text((result.remainBonus / 1000000000000000000).toFixed(5) + " NAS");
        $("#keyPrice").text(" * " + (result.keyPrice / 1000000000000000000 * 1.1 ).toFixed(5) + " NAS");
        $("#price").text(result.keyPrice / 1000000000000000000);
        target_date = result.deadline;

    }).catch(function (err) {
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

//return of search,
function cbSearch(resp) {
    $("#loading").modal("hide");

    var result = JSON.parse(resp.result); ////resp is an object, resp.result is a JSON string
    // console.log("return of rpc call: " + JSON.stringify(result))
    console.log(result);
    // var resultString = JSON.stringify(result);
    $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
    $("#keyCountOfAddress").text(result.keyCountOfAddress);
    $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
    $("#unbonus").text((result.remainBonus / 1000000000000000000).toFixed(5) + " NAS");
    $("#keyPrice").text(" / " + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
    $("#price").text(result.keyPrice / 1000000000000000000);
    console.log("====", result.keyPrice);

    setTimeout(function () {
        $("#loading").modal("hide");
    }, 500);


    // 倒计时

    target_date = result.deadline; // set the countdown date
    

    getCountdown();

    setInterval(getCountdown, 1000);
}


var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var serialNumber
var callbackUrl = NebPay.config.mainnetUrl; //如果合约在主网,则使用这个
// var callbackUrl = NebPay.config.testnetUrl; //

// 购买key
$("#buy").click(function () {
    clearInterval(intervalQuery);
    $(".modal.loading").modal("show");
    //console.log("clear intervalQuery=" + intervalQuery)
    var to = dappAddress;
    var value = $('#price').text() * $("#account").val();

    value = value.toPrecision(15)
    var callFunction = "buyKey"
    var callArgs = "[]"
    var arg = ""
    // var callArgs = JSON.stringify(arg);
    serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
        listener: cbPush, //设置listener, 处理交易返回信息
        callback: callbackUrl,
        qrcode:{showQRCode:false}
    });
    intervalQuery = setInterval(function () {
        //console.log("querying intervalQuery=" + intervalQuery)
        funcIntervalQuery(callFunction);
    }, 6000);
});

//  领取分红奖励

$("#getBonus").click(function () {
    clearInterval(intervalQuery);
    //console.log("clear intervalQuery=" + intervalQuery)
    var to = dappAddress;
    var value = "0";;
    var callFunction = "getBonus"
    var callArgs = "[]"
    var arg = ""
    // var callArgs = JSON.stringify(arg);
    serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
        listener: callPush, //设置listener, 处理交易返回信息
        callback: callbackUrl,
        qrcode:{showQRCode:false}
    });
    intervalQuery = setInterval(function () {
        //console.log("querying intervalQuery=" + intervalQuery)
        funcIntervalQuery(callFunction);
    }, 6000);
});

var intervalQuery

function funcIntervalQuery(callFunction) {
    console.log(callFunction)
    var options = {
        callback: callbackUrl
    }
    nebPay.queryPayInfo(serialNumber, options) //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp) //resp is a JSON string
            var respObject = JSON.parse(resp);

            console.log(respObject);

            if (respObject.code === 0 && respObject.data.status !== 2) {
                $(".modal.loading").modal("hide");
                clearInterval(intervalQuery);


                if (respObject.data.status === 1) {
                    var execute_result = JSON.parse(respObject.data.execute_result);

                    // 提示信息
                    $("#title").text("温馨提示");
                    $("#msg").removeClass("hide");
                    if (callFunction == "buyKey") {
                        $(".message").html("购买成功! 你购买了 " + execute_result.amount + " 个珍珠, 每个价格为" + execute_result.price / 1000000000000000000 + " nas");
                    } else if (callFunction == "getBonus") {
                        $(".message").html("获得分红成功!");
                    }

                    // 再次请求 购买成功之后的数据
                    if(respObject.data.from != defaultAccount){
                        accountWallet = respObject.data.from;
                        $.cookie("accountWallet", accountWallet)
                    }
                   
                    var value = "0";
                    var nonce = "0"
                    var gas_price = "1000000"
                    var gas_limit = "2000000"
                    var _callFunction = "getInfo";
                    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
                    var arg = ''
                    var callArgs = JSON.stringify([arg]); //推荐用 JSON.stringify 来生成参数字符串,这样会避免出错!
                    var contract = {
                        "function": _callFunction,
                        "args": callArgs
                    }
                    neb.api.call(accountWallet, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                        var result = JSON.parse(resp.result);
                        $("#pond").text((result.pond / 1000000000000000000).toFixed(5) + " NAS");
                        $("#keyCountOfAddress").text(result.keyCountOfAddress);
                        $("#bonus").text((result.bonus / 1000000000000000000).toFixed(5) + " NAS");
                        $("#unbonus").text((result.remainBonus / 1000000000000000000).toFixed(5) + " NAS");
                        $("#keyPrice").text(" / " + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
                        $("#price").text(result.keyPrice / 1000000000000000000);
                        target_date = result.deadline;

                    }).catch(function (err) {
                        console.log("error:" + err.message)
                    })
                } else if (respObject.data.status === 0) {
                    // alert(respObject.data.execute_error);
                    // 提示信息
                    var tip = language == 'zh' ? '温馨提示' : 'Tips';
                    var msg = language == 'zh' ? '合约调用失败' : 'call contract failed';
                    $("#title").text(tip);
                    $("#msg").removeClass("hide");
                    $(".message").text(msg + ':' + respObject.data.execute_error);
                }
            } else if (respObject.code != 0) {
                $(".modal.loading").modal("hide");
                /*
                $("#title").text(language == 'zh'?'温馨提示':'Tips');
                $("#msg").removeClass("hide");
                $(".message").text(respObject.msg);    
                */
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
        $("#loading").modal("hide");
        //alert(respString)
        var tip = language == 'zh' ? '温馨提示' : 'Tips';
        $("#title").text(tip);
        $("#msg").removeClass("hide");
        $(".message").text(respString);

    } else if (respString.search("txhash") !== -1) {
        //alert("wait for tx result: " + resp.txhash)
    }
}

function callPush(resp) {
    console.log("response of push: " + JSON.stringify(resp))
    var respString = JSON.stringify(resp);
    if (respString.search("rejected by user") !== -1) {
        clearInterval(intervalQuery)
        $("#loading").modal("hide");
        var tip = language == 'zh' ? '温馨提示' : 'Tips';
        $("#title").text(tip);
        $("#msg").removeClass("hide");
        $(".message").text(respString);
    } else if (respString.search("txhash") !== -1) {
        //alert("wait for tx result: " + resp.txhash)
    }
}