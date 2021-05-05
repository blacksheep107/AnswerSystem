// miniprogram/pages/pkprepare/pkprepare.js
const app=getApp();
wx.cloud.init({
  env: 'fzuanswersystem-7g3gmzjw761ecfdb'
});
const db=wx.cloud.database({
  env: 'fzuanswersystem-7g3gmzjw761ecfdb'
});
const pk=db.collection('pk');
var roomid='';
var watchpk;
const _ = db.command;
Page({
  data: {
    ownerid:'',
    pbuttonishide:'hidden',
    sbuttonhide:'hidden',
    ownerbegin:'hidden',
    roomid:'',
    leftdata:{
      avatarUrl:'',
      nickName:'',
    },
    rightdata:{
      avatarUrl:'',
      nickName:'',
    },
  },
  beginpk(){
    // 开始
    pk.doc(this.data.roomid).update({
      data:{
        status:'pk',
        rightpoint:0,
        leftpoint:0,
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new Promise(resolve=>{
      wx.cloud.callFunction({
        name:'login',
        data:{},
        success:res=>{
          app.globalData.openid = res.result.OPENID;
          resolve();
        }
      })      
    }).then(
      watchpk=pk.doc(options.roomid).watch({
        onChange:snapshot=>{
          console.log(snapshot);
          console.log(snapshot.docChanges[0].updatedFields);
          if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields['rightdata.avatarUrl']!==undefined){
            this.setData({
              rightdata:{
                avatarUrl:snapshot.docChanges[0].updatedFields['rightdata.avatarUrl'],
                nickName:snapshot.docChanges[0].updatedFields['rightdata.nickName'],
                openid:app.globalData.openid,
              },
              sbuttonhide:'hidden',
            });
            if(this.data.ownerid==app.globalData.openid){
              this.setData({
                ownerbegin:'',
              });
            }
          }else if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields.status=='pk'){
            wx.navigateTo({
              url: '../pk/pk?roomid='+roomid,
            });
          }
        },
        onError:err=>{
          console.error(err);
        }
      })
    )
    roomid=options.roomid;
    this.setData({
      roomid:options.roomid,
    });
    // 获取左用户头像昵称
    pk.doc(options.roomid).get({
      success:res=>{
        console.log(res);
        this.setData({
          ownerid:res.data.ownerid,
          leftdata:res.data.leftdata,
        });
      }
    });
    if(options.gametype=='invite'){
      // 获取新用户信息
      this.setData({
        pbuttonishide:''
      });
    }else{
      this.setData({
        sbuttonhide:''
      });
    }
  },
  onUnload:function(){
    // 用户退出，删除房间
    watchpk.close();
    wx.cloud.callFunction({
      name:'removeRoom',
      data:{
        roomid:this.data.roomid
      },
      success:res=>{
        console.log(res);
      },
      fail:console.error
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res.userInfo.avatarUrl);
        let newavatar='';
        if(res.userInfo.avatarUrl==''){
          newavatar='https://pic1.zhimg.com/80/v2-6afa72220d29f045c15217aa6b275808_720w.jpg?source=1940ef5c';
        }
        pk.doc(this.data.roomid).update({
          data:{
            rightdata:{
              avatarUrl:res.userInfo.avatarUrl,
              nickName:res.userInfo.nickName,
            },
          },
          success:res=>{
            console.log(res);
            this.setData({
              pbuttonishide:'hidden',
            });
          }
        });
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title:'来和我PK吧',
      path:'/pages/pkprepare/pkprepare?roomid='+this.data.roomid+'&&gametype=invite',
    }
  }
})