// miniprogram/pages/pkprepare/pkprepare.js
const app=getApp();
wx.cloud.init({
  env: 'fzuanswersystem-4gg97ebafd3efbe9'
});
const db=wx.cloud.database({
  env: 'fzuanswersystem-4gg97ebafd3efbe9'
});
const pk=db.collection('pk');
const watchpk=pk.watch({
  onChange:snapshot=>{
    console.log(snapshot);
    // rightdata改变，两边用户都进入
    // 新用户进入，更新sbutton
  },
  onError:err=>{
    console.error(err);
  }
});
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ownerid:'',
    pbuttonishide:'hidden',
    sbuttonhide:'hidden',
    leftdata:{
      avatarUrl:'',
      nickName:'',
    },
    rightdata:{
      avatarUrl:'',
      nickName:'',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      // ownerid:options.ownerid,
      roomid:options.roomid,
    });
    // 获取左用户头像昵称
    pk.doc(this.data.roomid).get({
      success:res=>{
        console.log(res);
        this.setData({
          leftdata:res.data.leftdata,
        });
      }
    });
    if(options.gametype=='invite'){
      // 获取新用户信息
      this.setData({
        pbuttonishide:''
      });
      // 更新右边用户
      // pk.doc(this.data.roomid).update({
      //   data:{
      //     rightdata:{}
      //   }
      // })
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
        console.log(res);
        pk.doc(this.data.roomid).update({
          data:{
            rightdata:{
              avatarUrl:res.userInfo.avatarUrl,
              nickName:res.userInfo.nickName,
            },
          },
          success:res=>{
            console.log(res);
          }
        });
        // this.setData({
        //   avatarUrl: res.userInfo.avatarUrl,
        //   userInfo: res.userInfo,
        //   hasUserInfo: true,
        // })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title:'来和我PK吧',
      path:'/miniprogram/pages/pkprepare/pkprepare?roomid='+this.data.roomid+'&&gametype=invite',
    }
  }
})