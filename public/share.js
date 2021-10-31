function get_json(res) {
  if (!res.ok) throw Error(`网络错误 ${res.status} ${res.statusText}`);
  return res.text().then((t) => {
    try {
      return JSON.parse(t);
    } catch (e) {
      console.error('json parse error');
      console.trace(e);
      console.log(t);
      throw new SyntaxError('JSON Parse Error ' + t.substr(0, 50));
    }
  });
}
const handle_response = async (response, notify = false) => {
  const json = await get_json(response);
  if (json.status !== 0) {
    if (json) {
      if (notify) alert(json.msg);
      else throw new Error(json.msg);
    } else throw new Error(JSON.stringify(json));
  }
  return json;
};

var appId, timestamp, nonceStr, signature;
//获取当前页面的url
var linkUrl = window.location.href;
//encodeURIComponent(),请求后台接口需要用encodeURIComponent()
var encodeUrl = encodeURIComponent(linkUrl);
// const API = {
//   sharePage: async () => {
//     const response = await fetch(
//       'http://39.105.113.112/Tree_Hole_Login/autoreply.php' +
//         '?url=' +
//         encodeUrl,
//       // {
//       //   method: 'GET',
//       //   headers: {
//       //     'Content-Type': 'application/x-www-form-urlencoded',
//       //   },
//       // },
//     );
//     return handle_response(response);
//   },
// };
// API.sharePage()
//   .then((msg) => {
//     if (msg.status === 0) {
//       appId = msg.data.appId; // appid
//       timestamp = msg.data.timestamp; // timestamp
//       nonceStr = msg.data.nonceStr; // noncestr
//       signature = msg.data.signature; // signature
//     }
//     console.log('设置成功');
//     console.log(signature);
//     wx.config({
//       debug: true,
//       appId: appId,
//       timestamp: timestamp,
//       nonceStr: nonceStr,
//       signature: signature,
//       jsApiList: [
//         // 所有要调用的 API 都要加到这个列表中
//         'updateTimelineShareData',
//         'updateAppMessageShareData',
//         'onMenuShareAppMessage', //旧的接口，即将废弃
//         'onMenuShareTimeline', //旧的接口，即将废弃
//       ],
//     });
//     wx.ready(function () {
//       // 微信分享的数据
//       // var shareData = {
//       //   imgUrl: '../src/infrastructure/appicon/cover2.png',
//       //   link: 'http://spring-autumn.net/Tree_Hole_Login/Login',
//       //   desc: 'NK树洞',
//       //   title: 'NK树洞',
//       //   success: function () {
//       //     // 分享成功可以做相应的数据处理
//       //   },
//       // };
//       //分享微信朋友圈
//       wx.updateTimelineShareData({
//         title: 'NK树洞', // 分享标题
//         link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//         imgUrl:
//           'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
//         success: function () {
//           // 用户点击了分享后执行的回调函数
//         },
//       });
//       //分享给朋友
//       wx.updateAppMessageShareData({
//         title: 'NK树洞', // 分享标题
//         desc: 'NK树洞', // 分享描述
//         link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//         imgUrl:
//           'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
//         success: function () {
//           // 用户点击了分享后执行的回调函数
//         },
//       });
//       wx.onMenuShareAppMessage({
//         title: 'NK树洞', // 分享标题
//         desc: 'NK树洞', // 分享描述
//         link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//         imgUrl:
//           'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
//         success: function () {
//           // 用户点击了分享后执行的回调函数
//         },
//       });
//     });
//     wx.error(function (res) {
//       alert(res.errMsg); //错误提示
//     });
//   })
//   .catch(console.log('设置失败'));
fetch(
  'http://spring-autumn.net//Tree_Hole_Login/autoreply.php' +
    '?url=' +
    encodeUrl,
)
  .then(function (response) {
    return response.text().then((t) => {
      try {
        return JSON.parse(t);
      } catch (e) {
        console.error('json parse error');
        console.trace(e);
        console.log(t);
        throw new SyntaxError('JSON Parse Error ' + t.substr(0, 50));
      }
    });
  })
  .then(function (msg) {
    // console.log(linkUrl);
    if (msg.status === 0) {
      appId = msg.data.appId; // appid
      timestamp = msg.data.timestamp; // timestamp
      nonceStr = msg.data.nonceStr; // noncestr
      signature = msg.data.signature; // signature
    }
    console.log('设置成功');
    console.log(signature);
    wx.config({
      debug: false,
      appId: appId,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature,
      jsApiList: [
        // 所有要调用的 API 都要加到这个列表中
        'updateTimelineShareData',
        'updateAppMessageShareData',
        'onMenuShareAppMessage', //旧的接口，即将废弃
        'onMenuShareTimeline', //旧的接口，即将废弃
      ],
    });
    wx.ready(function () {
      // 微信分享的数据
      // var shareData = {
      //   imgUrl: '../src/infrastructure/appicon/cover2.png',
      //   link: 'http://spring-autumn.net/Tree_Hole_Login/Login',
      //   desc: 'NK树洞',
      //   title: 'NK树洞',
      //   success: function () {
      //     // 分享成功可以做相应的数据处理
      //   },
      // };
      //分享微信朋友圈
      wx.updateTimelineShareData({
        title: 'NK树洞', // 分享标题
        link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl:
          'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
        success: function () {
          // 用户点击了分享后执行的回调函数
        },
      });
      //分享给朋友
      wx.updateAppMessageShareData({
        title: 'NK树洞', // 分享标题
        desc: '让需求不再沉默', // 分享描述
        link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl:
          'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
        success: function () {
          // 用户点击了分享后执行的回调函数
        },
      });
      wx.onMenuShareAppMessage({
        title: 'NK树洞', // 分享标题
        desc: '让需求不再沉默', // 分享描述
        link: 'http://spring-autumn.net/Tree_Hole_Login/Login', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl:
          'http://spring-autumn.net/Tree_Hole_Login/Login/static/favicon/cover2.png', // 分享图标
        success: function () {
          // 用户点击了分享后执行的回调函数
          console.log('分享成功');
        },
      });
    });
  })
  .catch(console.log('设置失败'));
