"use strict";

var language = window.location.href.indexOf("/en/") > 0 ? 'en' : 'zh';
var tip = language == 'zh' ? '温馨提示' : 'Tips';

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

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

var Nebulas = require("nebulas");
var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay

var env = window.location.href.indexOf("test") ? 'testnet' : 'mainnet';

var dappAddress = "n1gYtsHxQz4nVPxEvKopzuikXfqZpGQfAFJ";
var nebulasUrl = "https://chainplay.io";
var payCallbackUrl = NebPay.config.mainnetUrl;

nebulasUrl = 'https://testnet.nebulas.io';
payCallbackUrl = NebPay.config.testnetUrl;


if (env == 'testnet') {
    dappAddress = 'n1gYtsHxQz4nVPxEvKopzuikXfqZpGQfAFJ';
    nebulasUrl = 'https://testnet.nebulas.io';
    payCallbackUrl = NebPay.config.testnetUrl;
}

var url = window.location.href;

//here we use neb.js to call the "get" function to search from the Dictionary

var Account = Nebulas.Account;
var neb = new Nebulas.Neb();
neb.setRequest(new Nebulas.HttpRequest(nebulasUrl));
var defaultAccount = Account.NewAccount().getAddressString();

var intervalQuery;
class Melo {
    constructor(dappAddress, url, language) {
        this.dappAddress = dappAddress;

        this.language = language;

        this.account = this._getAccountFromCookie();

        this.target_date = new Date().getTime() + 24 * 3600 * 1000;
        this.start_date = new Date().getTime();

        this.countdownID = document.getElementById("countdown-time"); // get tag element
        this.nebPay = new NebPay();

        this.number = 0
        this.is_register = false;

        this.invite_code = this._getInviteCode(url)

        console.log("invite_code:", this.invite_code)
    }

    _getInviteCode(url) {
        var urls = url.split("/")
        var addr = urls[urls.length - 1];

        if (addr && addr.length == 35 && addr[0] == 'n' && (addr[1] == 1 || addr[1] == 2)) {
            if (this.account != '' && addr == this.account) {
                return ''
            }
            return addr;
        } else if (url.indexOf("invitecode") > 0) {
            var urls = url.split("invitecode=")
            var item = urls[1];
            var items = item.split("&");
            var addr = items[0];

            if (addr && addr.length == 35 && addr[0] == 'n' && (addr[1] == 1 || addr[1] == 2)) {
                if (this.account != '' && addr == this.account) {
                    return ''
                }
                return addr;
            }
        }


        return ''
    }

    load(callback) {
        this.status = 'onloading';

        var that = this
        setTimeout(function () {
            that._checkWallet()
        }, 2000)

        this.getInfo()
    }

    getInfo() {
        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getInfo";
        var arg = ''
        var callArgs = JSON.stringify([arg]); //推荐用 JSON.stringify 来生成参数字符串,这样会避免出错!
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        var that = this
        var account = this.account ? this.account : defaultAccount
        neb.api.call(account, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {


            var result = JSON.parse(resp.result);
            $("#pond").text((result.pond / 1000000000000000000).toFixed(4) + " NAS");
            $("#keyCountOfAddress").text(result.keyCountOfAddress);
            $("#bonus").text((result.bonus / 1000000000000000000).toFixed(4) + " NAS");
            $("#unbonus").text((result.remainBonus / 1000000000000000000).toFixed(4) + " NAS");
            $("#keyPrice").text(" x " + (result.keyPrice / 1000000000000000000).toFixed(5) + " NAS");
            $("#price").text(result.keyPrice / 1000000000000000000);

            var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
            value = value.toFixed(4)

            $("#keyValue").text(" ≈ " + value + " NAS");

            $("#invite").text((result.inviteReward / 1000000000000000000).toFixed(4) + " NAS");

            $("#prize").text((result.eggReward / 1000000000000000000).toFixed(4) + " NAS")
            $("#total").text((result.eggReward / 1000000000000000000 + result.inviteReward / 1000000000000000000 + result.bonus / 1000000000000000000).toFixed(4) + " NAS")
            // " + result.eggCount + "次");
            //console.log((result.eggReward / 1000000000000000000).toFixed(4) + " NAS / " + result.eggCount + "次")

            that.target_date = result.deadline;

            that.start_date = result.startTime;


            if (account != defaultAccount) {
                that.number = result.keyCountOfAddress;
                that.is_register = true;
            }

            if (that.status == 'onloading') {
                that.status = "onshow";
                var current_date = new Date().getTime();
                var start_seconds_left = (that.start_date - current_date) / 1000;

                if (start_seconds_left > 0) {
                    var d = new Date(that.start_date)
                    var s = d.format('yyyy-MM-dd hh:mm:ss');

                    var msg = "<p></p><p style='text-align:center;font-size:16px;'>转化兽将在 "+s+" 全球开启</p><p style='height:30px;'></p><p></p><p></p>"
                    showDialog(tip, msg)
                }

                hideLoad();
                that.countdown();
                setInterval(function () {
                    that.countdown();

                }, 1000)
                setInterval(function () {
                    that.getInfo()
                }, 20000)
            }
        }).catch(function (err) {
            console.log("getInfo" + err)
        })
    }

    buy(is_checked) {
        if (!is_checked && this.number == 0) {
            $('#buy-dialog').modal('show')
            return
        }
        if (is_checked) {
            $('#buy-dialog').modal('hide')
        }

        loading();
        clearInterval(intervalQuery);
        var to = this.dappAddress;
        var value = $('#price').text() * $("#pearlNumber").val() + 0.001;

        value = value.toPrecision(15)
        var callFunction = "buyKey"

        if (this.invite_code == this.account) {
            this.invite_code = '';
        }
        var arg = this.invite_code
        var callArgs = JSON.stringify([arg]);
        var serialNumber = this.nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
            listener: this.nebpayListener, //设置listener, 处理交易返回信息
            callback: payCallbackUrl,
            qrcode: {
                showQRCode: false
            }
        });

        var that = this
        intervalQuery = setInterval(function () {
            //console.log("querying intervalQuery=" + intervalQuery)
            that._intervalQuery(callFunction, serialNumber);
        }, 6000);
    }

    getBonus() {
        loading();
        clearInterval(intervalQuery);
        //console.log("clear intervalQuery=" + intervalQuery)
        var to = this.dappAddress;
        var value = "0";
        var callFunction = "getBonus"
        var callArgs = "[]"
        // var callArgs = JSON.stringify(arg);
        var serialNumber = this.nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
            listener: this.nebpayListener, //设置listener, 处理交易返回信息
            callback: payCallbackUrl,
            qrcode: {
                showQRCode: false
            }
        });
        var that = this
        intervalQuery = setInterval(function () {
            //console.log("querying intervalQuery=" + intervalQuery)
            that._intervalQuery(callFunction, serialNumber);
        }, 6000);
    }

    share() {
        var msg = "<p>邀请你的好友一起来玩转化兽，成功邀请到一个好友并购买珍珠你会得到他的6%分红，如果他继续邀请好友你同样会得到一定比例的分红依次为2.4%和1.6%</p>";
        if (this.is_register || (this.account && this.account.length>0)) {
            console.log("=====",this.is_register , this.account)
            msg += '<p> 下面是你的邀请链接 </p><p>https://chainplay.io/' + this.account + '</p>';
        } else {
            msg += "<p>你还没有绑定NAS钱包,请先通过chrome绑定NAS钱包插件或者直接购买珍珠即可绑定</p>";
        }

        showDialog('邀请好友', msg);
    }

    countdown() {
        var days, hours, minutes, seconds; // variables for time units

        // find the amount of "seconds" between now and target
        var current_date = new Date().getTime();
        var start_seconds_left = (this.start_date - current_date) / 1000;

        if (start_seconds_left > 0) {
            days = pad(parseInt(start_seconds_left / 86400));
            start_seconds_left = start_seconds_left % 86400;

            hours = pad(parseInt(start_seconds_left / 3600));
            start_seconds_left = start_seconds_left % 3600;

            minutes = pad(parseInt(start_seconds_left / 60));
            seconds = pad(parseInt(start_seconds_left % 60));

            $("#countdown-text").text("转化兽马上开始")
        } else {
            var seconds_left = (this.target_date - current_date) / 1000;
            if (seconds_left <= 0) {
                hours = 0;
                minutes = 0;
                seconds = 0;

                $("#countdown-text").text("转化兽已西去")
            } else {

                $("#countdown-text").text("转化兽生命值")

                days = pad(parseInt(seconds_left / 86400));
                seconds_left = seconds_left % 86400;

                hours = pad(parseInt(seconds_left / 3600));
                seconds_left = seconds_left % 3600;

                minutes = pad(parseInt(seconds_left / 60));
                seconds = pad(parseInt(seconds_left % 60));
            }
        }
        console.log(this.countdownID)
        // format countdown string + set tag value
        this.countdownID.innerHTML = "<span>" + hours + "</span><span>" + minutes + "</span><span>" + seconds + "</span>";
    }


    _intervalQuery(callFunction, serialNumber) {
        console.log(callFunction)
        var options = {
            callback: payCallbackUrl
        }
        var that = this
        this.nebPay.queryPayInfo(serialNumber, options) //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                console.log("tx result: " + resp) //resp is a JSON string
                var respObject = JSON.parse(resp);

                console.log(respObject);

                if (respObject.code === 0 && respObject.data.status !== 2) {
                    hideLoad()
                    clearInterval(intervalQuery);

                    if (respObject.data.status === 1) {
                        var execute_result = JSON.parse(respObject.data.execute_result);

                        if (callFunction == "buyKey") {
                            var msg = "<p>购买成功! 你购买了 " + execute_result.amount + " 个珍珠, 每个价格为" + execute_result.price / 1000000000000000000 + " nas</p><p></p>";

                            if (execute_result.egg && execute_result.egg != 0 && execute_result.egg > 0) {
                                msg = "<p style='color:#f47321;'>哇塞！你不仅购买成功了，你还中奖了</p>";
                                msg += "<p>恭喜你,你将获得" + execute_result.egg / 1000000000000000000 + " nas,别忘记了领奖和分享给朋友哦</p>"
                                msg += "<p>你购买了 " + execute_result.amount + " 个珍珠, 每个价格为" + execute_result.price / 1000000000000000000 + " nas</p>";
                            }

                            if (execute_result.registerResult && execute_result.registerResult==0){
                                msg += '另外另外由于你的好友邀请了你，恭喜你获得一个免费的珍珠，快去邀请好友获更多奖励';
                            }

                            showDialog(tip, msg)
                        } else if (callFunction == "getBonus") {
                            var msg = '获得分红成功!';
                            showDialog(tip, msg)
                        }

                        // 再次请求 购买成功之后的数据
                        if (respObject.data.from != defaultAccount) {
                            that._updateAccountCookie(respObject.data.from)
                        }

                        that.getInfo()
                    } else if (respObject.data.status === 0) {
                        // alert(respObject.data.execute_error);
                        // 提示信息
                        var msg = language == 'zh' ? '合约调用失败' : 'call contract failed';
                        showDialog(tip, msg + ':' + respObject.data.execute_error)
                    }
                } else if (respObject.code != 0) {
                    if (respObject.msg.indexOf("not exist") == -1) {
                        hideLoad()
                        clearInterval(intervalQuery)
                    }
                }
            })
            .catch(function (err) {
                console.log('err:' + err);
                hideLoad()
            });
    }

    _getAccountFromCookie() {
        var account = $.cookie("accountWallet");
        return account && account.length == 35 ? account : '';
    }

    _updateAccountCookie(account) {
        this.account = account;
        $.cookie("accountWallet", account)
    }

    _checkWallet() {
        var that = this
        if (!browser.versions.mobile) {
            if (typeof (webExtensionWallet) === "undefined") {
                var msg = this.language == 'zh' ? '转化兽是基于星云链的一款应用，需要依赖星云chrome钱包插件，安装地址' : 'Melo the Converter is an application based on the nebula chain, you need to rely on the nebula chrome wallet plugin, install the address';
                showDialog(tip, msg + ":<a target='_blank' href='https://chrome.google.com/webstore/detail/nasextwallet/gehjkhmhclgnkkhpfamakecfgakkfkco'>Chrome Web Store</a>");
            } else {
                NasExtWallet.getUserAddress(function (addr) {
                    addr = addr && addr.length == 35 ? addr : '';
                    if (that.account != addr) {
                        that.account = addr;
                        that.getInfo();
                    }
                })
            }
        }
    }

    nebpayListener(serialNumber, result) {

        var respString = JSON.stringify(result);


        if (respString.indexOf("rejected") > 0) {

            hideLoad()
            //showDialog(tip, respString)
            clearInterval(intervalQuery)
        } else if (respString.search("txhash") !== -1) {
            //alert("wait for tx result: " + resp.txhash)
        }
    }
}

function loading() {
    $(".modal.loading").modal("show");
}

function hideLoad() {
    $(".modal.loading").modal("hide");
}



function pad(n) {
    return (n < 10 ? '0' : '') + n;
}


function showDialog(title, msg) {

    $('#melo-dialog').modal('show')
    $("#melo-dialog-title").text(title);
    $("#melo-dialog-body").html(msg);
}

var melo = new Melo(dappAddress, url, language);

// 页面加载时请求数据
$(function () {
    $(".modal.loading").modal("show");

    melo.load();
})

$().ready(function () {
    // 增加key
    $("#add1").click(function () {
        $("#pearlNumber").val(parseInt($("#pearlNumber").val()) + 1);

        var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
        value = value.toFixed(4)
        $("#keyValue").text(" ≈ " + value + ' NAS')

    })
    $("#add2").click(function () {
        $("#pearlNumber").val(parseInt($("#pearlNumber").val()) + 2);
        var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
        value = value.toFixed(4)
        $("#keyValue").text(" ≈ " + value + ' NAS')
    })
    $("#add5").click(function () {
        $("#pearlNumber").val(parseInt($("#pearlNumber").val()) + 5);
        var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
        value = value.toFixed(4)
        $("#keyValue").text(" ≈ " + value + ' NAS')
    })
    $("#add10").click(function () {
        $("#pearlNumber").val(parseInt($("#pearlNumber").val()) + 10);
        var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
        value = value.toFixed(4)
        $("#keyValue").text(" ≈ " + value + ' NAS')
    })
    $("#add100").click(function () {
        $("#pearlNumber").val(parseInt($("#pearlNumber").val()) + 100);
        var value = $('#price').text() * parseInt($("#pearlNumber").val()) + 0.001;
        value = value.toFixed(4)
        $("#keyValue").text(" ≈ " + value + ' NAS')
    })
    $("#clear").click(function () {
        $("#pearlNumber").val(0);
        $("#keyValue").text(" ≈ - NAS")
    })

    // 显示 关闭 简介规则玩法
    $("#showIntroduction").click(function () {
        $('#introduction-dialog').modal('show')
    })

    $(".help-icon").click(function () {
        $('#introduction-dialog').modal('show')
    })

    $(".data-icon").click(function () {
        var tip = '数据说明'
        var msg = '<p>1.奖池将属于最后7个人 最后一人获得40%的奖池，其他人各10%</p>'
        msg += '<p>2.每10分钟分红一次, 可累积后一次性领取</p>'
        msg += '<p>3.一次购买10+个NAS，将有一定的几率获得5%的奖金池</p>'
        msg += '<p>4. 总计收益包含累积分红、彩蛋收益以及邀请奖励三者总和</p>'
        msg += '<p></p>'
        showDialog(tip, msg)
    })


    $("#exit").click(function () {
        $("#msg").addClass("hide");
    })


    // 购买key
    $("#buy").click(function () {
        melo.buy(false)
    })

    $(".goon-buy").click(function () {
        melo.buy(true)
    })

    //  领取分红奖励
    $("#getBonus").click(function () {
        melo.getBonus()
    });

    //分享给好友
    $(".shareFriends").click(function () {
        melo.share()
    });
});