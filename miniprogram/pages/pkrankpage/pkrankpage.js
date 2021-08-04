// miniprogram/pages/pkrankpage/pkrankpage.js
const db=wx.cloud.database();
const pk=db.collection('pk4');
const _ = db.command;
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomid:null,
    fourData:[],
    maxindex:0, // 最高分
    winnerback:'background: linear-gradient(0deg, #E6A23C 0%, #E6A23C 100%);border-radius: 70rpx;',
    otherback:'background: white;border-radius: 70rpx;',
    isme:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.roomid=options.roomid;
    pk.doc(options.roomid).get().then(res=>{
      let d=res.data.userdata.sort(function(a,b){
        return a.point-b.point;
      });
      this.setData({
        fourData:d
      });
      console.log(this.data.fourData,'fourData');
      for(let i=0;i<this.data.fourData.length;i++){
        if(this.data.fourData[i].openid==app.globalData.openid){
          this.setData({
            isme:true
          });
        }
      }
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