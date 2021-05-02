// miniprogram/pages/pkprepare/pkprepare.js
const app=getApp();
wx.cloud.init({
  env: 'fzuanswersystem-4gg97ebafd3efbe9'
});
const db=wx.cloud.database({
  env: 'fzuanswersystem-4gg97ebafd3efbe9'
});
const pk=db.collection('pk');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ownerid:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ownerid:options.ownerid
    });
  },
  onUnload:function(){
    // 用户退出，删除房间
    wx.cloud.callFunction({
      name:'removeRoom',
      data:{
        ownerid:this.data.ownerid
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})