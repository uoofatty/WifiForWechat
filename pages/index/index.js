// pages/QRC/qrc.js
//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */

  data: {
    startError: '',//初始化错误提示
    wifiListError: false, //wifi列表错误显示开关
    wifiListErrorInfo: '',//wifi列表错误详细
    system: '', //版本号
    platform: '', //系统 android
    ssid: '',//wifi帐号(必填)
    pass: '',//无线网密码(必填)
    bssid: '',//设备号 自动获取
    endError: '',//连接最后的提示

    gowifiColor: '#999',
    gowifiStatus: '未连接',
    successWiFi: 'none',
    tapurl: '/pages/images/saomiao.png',
    status: '0'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      ssid: '请扫描二维码获取WIFI',
      gowifiColor: '#999',
      gowifiStatus: '未连接',
      successWiFi: 'none',
      tapurl: '/pages/images/saomiao.png',
      status: '0'
      //加载wifi是否连接，连接wifi的信息 待完成~
    });
  },
  /**
   * 扫描二维码获取ssid信息
   */
  saomiaoQRC: function () {
    var _this = this;
    if (_this.data.status == '1') {
      _this.onLoad();
    } else {
      wx.scanCode({
        success: (res) => {

          if (res.result.indexOf('wyy') != -1) {

            var qrc = res.result.split(';');
            
            var ssidWiFi = qrc[1].split(':')[1];
            var passWiFi = qrc[2].split(':')[1];

            _this.setData({
              ssid: ssidWiFi,
              pass: passWiFi
            });

            _this.goWiFiDoor(_this);
          }else if (res.result.indexOf('WIFI') != -1) {


            var qrc = res.result.split(';');
            console.log();
            var ssidWiFi = qrc[2].split(':')[1];
            var passWiFi = qrc[1].split('\"')[1];

            _this.setData({
              ssid: ssidWiFi,
              pass: passWiFi
            });

            _this.goWiFiDoor(_this);
          }  else {
            console.log('无法识别的二维码');
            _this.setData({
              ssid: '无法识别的二维码',
            });
          }
        }
      })
    }

  },
  /**
   *链接入口 
   */
  goWiFiDoor: function (_this) {

    wx.getSystemInfo({
      success: function (res) {
        var system = '';

        if (res.platform == 'android') {
          system = parseInt(res.system.substr(8));
        }
        if (res.platform == 'ios') {
          system = parseInt(res.system.substr(4));
        }
        if (res.platform == 'android' && system < 6) {
          _this.setData({
            startError: '手机版本暂时不支持',
            ssid: '手机版本暂时不支持'
          });
          return
        }

        if (res.platform == 'ios' && system < 11) {
          _this.setData({
            startError: '手机版本暂时不支持',
            ssid: '手机版本暂时不支持'
          });
          return
        }

        _this.setData({ platform: res.platform });
        //初始化 Wi-Fi 模块
        _this.startWifi(_this);
      },
    })
  },
  /**
  * 初始化 Wi-Fi 模块
  */
  startWifi: function (_this) {
    wx.startWifi({
      success: function () {
        _this.getList(_this);
      },
      fail: function (res) {
        _this.setData({ startError: res.errMsg });
      }
    })
  },
  getList: function (_this) {
    //安卓执行方法
    if (_this.data.platform == 'android') {
      //请求获取 Wi-Fi 列表
      wx.getWifiList({
        success: function (res) {
          //安卓执行方法
          _this.AndroidList(_this)
        },
        fail: function (res) {
          _this.setData({ wifiListError: true });
          _this.setData({ wifiListErrorInfo: res.errMsg });
        }
      })
    }
    //IOS执行方法
    if (_this.data.platform == 'ios') {
      console.log("执行~1111");
      wx.getWifiList({
        success: function (res) {
          //ios执行方法
          _this.IosList(_this)
        },
        fail: function (res) {
          _this.setData({ wifiListError: true });
          _this.setData({ wifiListErrorInfo: res.errMsg });
        }
      })
    }
  },

  AndroidList: function (_this) {
    //监听获取到 Wi-Fi 列表数据
    wx.onGetWifiList(function (res) { //获取列表
      if (res.wifiList.length) {
  
        //循环找出信号最好的那一个
        var ssid = _this.data.ssid;
        var signalStrength = 0;
        var bssid = '';
        for (var i = 0; i < res.wifiList.length; i++) {
          if (res.wifiList[i]['SSID'] == ssid && res.wifiList[i]['signalStrength'] > signalStrength) {
            bssid = res.wifiList[i]['BSSID'];
            signalStrength = res.wifiList[i]['signalStrength'];
          }
        }
        if (!signalStrength) {
          _this.setData({ wifiListError: true });
          _this.setData({ wifiListErrorInfo: '未查询到设置的wifi' });
          return
        }
        _this.setData({ bssid: bssid });
        //执行连接方法
        //连接wifi
        _this.Connected(_this);
      } else {
        _this.setData({ wifiListError: true });
        _this.setData({ wifiListErrorInfo: '未查询到设置的wifi' });
      }
    })
  },
  IosList: function (_this) {
    //ios 获取列表
    wx.onGetWifiList(function (res) {
      if (res.wifiList.length) {
        //循环匹配设置的wifi信息
        var ssid = _this.data.ssid;
        var pass = _this.data.pass;
        var signalStrength = 0;
        var bssid = '';
        for (var i = 0; i < res.wifiList.length; i++) {
          if (res.wifiList[i]['SSID'] == ssid && res.wifiList[i]['signalStrength'] > signalStrength) {
            bssid = res.wifiList[i]['BSSID'];
            signalStrength = res.wifiList[i]['signalStrength'];
          }
        }
        if (!signalStrength) {
          _this.setData({ wifiListError: true });
          _this.setData({ wifiListErrorInfo: '未查询到设置的wifi' });
          return
        }
        //点击连接wifi
        wx.setWifiList({
          wifiList: [{
            SSID: ssid,
            BSSID: bssid,
            password: pass
          }],
          success:function(res){
            console.log('success in wifi');
            _this.successConnectWifi(_this);
            _this.setData({ bssid: bssid });
          }
        });
      } else {
        _this.setData({ wifiListError: true });
        _this.setData({ wifiListErrorInfo: '未查询到设置的wifi' });
        wx.setWifiList({
          wifiList: []
        })
      }
    })
  },
  //连接wifi
  Connected: function (_this) {
    wx.connectWifi({
      SSID: _this.data.ssid,
      BSSID: _this.data.bssid,
      password: _this.data.pass,
      success: function (res) {
        _this.successConnectWifi(_this);
      },
      fail: function (res) {
        _this.setData({ endError: res.errMsg });
      }
    })
  },
  
  successConnectWifi: function (_this){
    _this.setData({
      endError: 'wifi连接成功',
      gowifiColor: '#00bcD5',
      gowifiStatus: '已连接',
      successWiFi: 'block',
      tapurl: '/pages/images/wifi.png',
      status: '1'
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})