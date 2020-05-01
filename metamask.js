function startAnimation() {

}
function stopAnimation() {

}

var EXNCE = {};

(function () {
    function Metamask(CSRF) {
        this.initialize(CSRF);
    }

    Metamask.prototype = {
        initialize: function (CSRF) {
            this._network = [1,61,"1","61"];//3;// ethereum main network // 1 : ETH 61 : ETC
            this.CSRF_TOKEN = CSRF;
            this._metamask = this;
            this._message =  "TEST MESSAGE FOR VASA. MESSAGE ID: @";
            this._account = "-";
            this._signature="-";
            this._timestamp = 0;
            this._provider = "";
            this._vendor = "Metamask/TrustWallet/imToken/NiftyWallet";


            this.setVendor= function(vendor){
                this._vendor = vendor;
            }


            this.getTimeStamp= function(){
                return this._timestamp;
            }

            this.setTimeStamp= function(ts){
                this._timestamp = ts;
            }

            this.getSignature= function(){
                return this._signature;
            }

            this.setSignature= function(signature){
                this._signature = signature;
            }

            this.getAccount= function(){
                return this._account;
            }

            this.setAccount= function(account){
                this._account = account;
            }

            this.getSignedMessage = function () {
                return this._message;
            }

            this.setSignedMessage = function(data){
                this._message = data;
            }

            this.checkAccount = function(userAccount,callback){
                this.szTitle = "Checking Account!";
                if(userAccount.toString().toLowerCase() === this.getAccount().toLowerCase()){
                    this.szMsgType = "info";
                    this.szDescription = 'Account is valid.';
                    this.bResult = true;
                }else{
                    this.szMsgType = "error";
                    this.szDescription = 'Account is incorrect! Please switch metamask account to you are logged in EXNCE';
                    this.bResult = false;
                }
                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription});
                return this.bResult;
            }

            this.isInstalled = function(callback){

                this.szTitle = this._vendor+" Installation";
                this.bResult = false;
                if (typeof window.web3 !== 'undefined'){
                    this.szMsgType = "success";
                    this.szDescription = this._vendor+' is installed';
                    this.bResult = true;
                }else if(typeof window.ethereum !== 'undefined') {
                    this.szMsgType = "success";
                    this.szDescription = this._vendor+' is installed';
                    this.bResult = true;
                } else{
                    this.szMsgType = "error";
                    this.szDescription = this._vendor+' is not installed';
                    this.bResult = false;
                }

                if (typeof window.ethereum !== 'undefined'
                    || (typeof window.web3 !== 'undefined')) {
                    this._provider = window['ethereum'] || window.web3.currentProvider
                }else{
                    //this._provider=new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/ed0b078730f6405e84d54d1b620c9a41");
                }
                //window.web3 = new Web3(this._provider);


                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription});
                return this.bResult;
            }

            this.isLocked =  async function(callback){
                let that = this;
                var retObject={bResult:false,szMsgType:"",szDescription:"",szAccount:""};
                this.szTitle = this._vendor+" Status";

                if (typeof window.ethereum !== 'undefined'){
                    await ethereum.enable().then((account) => {
                        let bNetworkStatus = true;
                        if(typeof ethereum != "undefined"){
                            if(typeof ethereum.networkVersion != "undefined"){
                                if (that._network.includes(ethereum.networkVersion) == false ) {
                                    retObject.szMsgType = "error";
                                    retObject.szDescription = 'This application requires the main network, please switch it in your MetaMask UI.';
                                    retObject.bResult = false;
                                    bNetworkStatus = false;
                                }
                            }
                        }
                        if(bNetworkStatus){
                            web3.eth.defaultAccount = account[0];
                            that.setAccount(account[0]);
                            retObject.bResult = true;
                            retObject.szMsgType = "success";
                            retObject.szDescription = that._vendor+' is accessible...';
                        }

                    }).catch(function (reason) {
                        retObject.szMsgType = "error";
                        retObject.szDescription = reason.stack;
                        retObject.bResult = false;
                    });
                } else if (typeof window.web3 !== 'undefined') {
                    let promise = new Promise((valid, invalid) => {
                        web3.eth.getAccounts(function(err, accounts){
                            if (err != null) {
                                retObject.szMsgType = "error";
                                retObject.szDescription = err;
                                retObject.bResult = false;
                                retObject.szAccount = "";
                            } else if (accounts.length === 0) {
                                retObject.szMsgType = "error";
                                retObject.szDescription = 'Could not read your accounts from MetaMask. Try unlocking it.';
                                retObject.bResult = false;
                                retObject.szAccount = "";
                            } else {
                                retObject.szMsgType = "info";
                                retObject.szDescription = that._vendor+' is accessible';
                                retObject.bResult = true;
                                retObject.szAccount = accounts[0]
                            }
                            valid(retObject);
                        });
                    });
                    let result = await promise;
                    that.setAccount(result.szAccount);
                    retObject.bResult = result.bResult;
                    retObject.szMsgType =  result.szMsgType;
                    retObject.szDescription = result.szDescription;
                }else{
                    let msg = "type of window.ethereum :"+typeof window.ethereum;
                    msg += "\r\ntype of window.web3:"+typeof window.web3;
                    msg += "\r\n"+that._vendor+" is not accessible!";

                    retObject.szMsgType = "error";
                    retObject.szDescription = msg;
                    retObject.bResult = false;
                }
                this.szMsgType = retObject.szMsgType;
                this.szDescription = retObject.szDescription;
                this.bResult = retObject.bResult;
                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription});
                return this.bResult;
            }



            this.checkNetwork = async function(callback) {
                let that = this;
                var retObject={szTitle:"",bResult:false,szMsgType:"",szDescription:""};
                retObject.szTitle = that._vendor+" Ethereum Network";
                let networkState = new Promise((valid, invalid) => {
                    web3.version && web3.version.getNetwork((err, netId) => {
                        if (err != null) {
                            retObject.szMsgType = "error";
                            retObject.szDescription = err;
                            retObject.bResult = false;
                        } else if(that._network.includes(netId )==false){
                            retObject.szMsgType = "error";
                            retObject.szDescription = 'This application requires the main network, please switch it in your MetaMask UI.';
                            retObject.bResult = false;
                        } else{
                            retObject.szMsgType = "info";
                            retObject.szDescription = that._vendor+' is working on ethereum main network.';
                            retObject.bResult = true;
                        }
                        valid(retObject);
                    });
                });

                let result =  await networkState;
                this.szTitle = result.szTitle;
                this.szMsgType = result.szMsgType;
                this.szDescription = result.szDescription;
                this.bResult = result.bResult;
                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription});
                return this.bResult;
            }

            this.signMessage = async function(callback) {
                var that = this;
                this.szTitle = that._vendor+" Sign";
                this.szMsgType = "info";
                this.szDescription = 'Signing Message...';
                this.bResult = false;
                var ts = new Date().getTime();
                var message = this.getSignedMessage()+ts+".";

                var retObject={bResult:false,szMsgType:"",szDescription:"",szData:null};
                let promise = new Promise((valid, invalid) => {
                    web3.personal.sign(web3.toHex(message),that.getAccount(),function (err,res) {
                        if (err != null) {
                            retObject.szMsgType = "error";
                            retObject.szTitle=that._vendor+" Message Signature";
                            retObject.szDescription = "User denied message signature...";
                            retObject.bResult = false;
                        }else{
                            retObject.szMsgType = "success";
                            retObject.szTitle=that._vendor+" Message Signature";
                            retObject.szDescription = "User accepted message signature...";
                            retObject.bResult = true;
                            retObject.szData = res;
                            that.setSignature(res);
                            that.setTimeStamp(ts)
                        }
                        valid(retObject);
                    });
                });
                let result = await promise;
                this.szMsgType = result.szMsgType;
                this.szDescription = result.szDescription;
                this.bResult = result.bResult;
                this.szData = result.szData;
                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription,message:message,ts:ts,signature:this.szData});
                return this.bResult;
            }

            this.verifyMessage = async function(callback) {
                var that = this;
                this.szTitle = that._vendor+" Verify Message";
                this.szMsgType = "info";
                this.szDescription = 'Verifying Message...';
                this.bResult = false;
                var ts = this.getTimeStamp();
                var message = this.getSignedMessage()+ts+".";
                var signature = this.getSignature();
                var retObject={bResult:false,szMsgType:"",szDescription:"",szData:null};
                let promise = new Promise((valid, invalid) => {
                    message = web3.toHex(message);
                    const msgParams = { data: message }
                    msgParams.sig =signature
                    const recovered = sigUtil.recoverPersonalSignature(msgParams);
                    if(recovered.toLowerCase() === that.getAccount().toLowerCase()){
                        retObject.szMsgType = "success";
                        retObject.szTitle=that._vendor+" Message Signature";
                        retObject.szDescription = "Message has been verified successfuly!";
                        retObject.bResult = true;
                        retObject.szData = recovered;
                    }else{
                        retObject.szMsgType = "error";
                        retObject.szTitle=that._vendor+" Message Signature";
                        retObject.szDescription = "Message cannot be verified!";
                        retObject.bResult = false;
                        retObject.szData = null;
                    }
                    valid(retObject);

                });
                let result = await promise;
                this.szMsgType = result.szMsgType;
                this.szDescription = result.szDescription;
                this.bResult = result.bResult;
                this.szData = result.szData;
                callback({success:this.bResult,type:this.szMsgType,title:this.szTitle,description:this.szDescription,message:message,ts:ts,signature:this.szData});
                return this.bResult;
            }

        }
    }
    EXNCE.Metamask = Metamask;
}());

var MetamaskAuth = new EXNCE.Metamask("");

function logData(data){
    console.dir(data);
}
async function setVendorType(vendor) {
    MetamaskAuth.setVendor(vendor)
}
async function checkMetamask(login,e) {
    startAnimation();

    if (MetamaskAuth.isInstalled(function (data) {
        logData(data);
    }).then === false) {
        stopAnimation();
        return false;
    }

    if (await MetamaskAuth.isLocked(function (data) {
        logData(data);
        document.getElementById("account").value = MetamaskAuth.getAccount();

           }) === false) {
        stopAnimation();
        return false;
    }

    if (await MetamaskAuth.checkNetwork(function (data) {
        logData(data);
    }) === false) {
        stopAnimation();
        return false;
    }

    document.getElementById("message").value = MetamaskAuth.getSignedMessage();//must be unsignedMessage variable name


    if (await MetamaskAuth.signMessage(function (data) {
        logData(data);
        document.getElementById("signed").value=data.signature;
    }) === false) {
        stopAnimation();
        return false;
    }

    if (await MetamaskAuth.verifyMessage(function (data) {
        logData(data);
        document.getElementById("output").value=data.signature; // recovery

    }) === false) {
        stopAnimation();
        return false;
    }

}

function metaStart(){
    setVendorType("Metamask");
    checkMetamask(false);
}

