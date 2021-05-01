// miniprogram/pages/answer/answer.js
const db=wx.cloud.database();
const easy=db.collection('easy_question');
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions:[],
    allquestions:[],
    count:0, // 第几题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    easy.get().then(res=>{
      console.log(res.data);
      new Promise((resolve)=>{
        res.data.forEach(item=>{
          if(!(item._id in app.globalData.answeredquestions)){
            // 没答过
            console.log(item);
            this.setData({
              questions:this.data.questions.concat(item)
            });
          }
        });
        resolve();     
      }).then(()=>{
        console.log(this.data.questions);
      })
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