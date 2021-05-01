// miniprogram/pages/register/register.js
const db=wx.cloud.database();
const users=db.collection('users');
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    studentid:"",
    name:"",
  },
  studentidinput(e){
    this.setData({
      studentid:e.detail.value
    });
  },
  nameinput(e){
    this.setData({
      name:e.detail.value
    });
  },
  registerClick(){
    // 提交
    console.log(this.data);
    users.add({
      data:{
        // openid:app.globalData.openid,
        studentid:this.data.studentid,
        name:this.data.name,
        answeredquestions:[], // 回答过的问题
      },
      success:res=>{
        console.log(res);
        this.globalData.name=this.data.name;
        this.globalData.studentid=this.data.studentid;
        this.globalData.id=res._id; // 数据库索引
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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