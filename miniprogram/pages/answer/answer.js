// miniprogram/pages/answer/answer.js
const db=wx.cloud.database();
const easy=db.collection('easy_question');
const medium=db.collection('medium_question');
const hard=db.collection('hard_question');
const users=db.collection('users');
const app=getApp();
const classcollection=db.collection('class');
const _=db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadhidden:'',
    finhidden:'hidden',
    allhihdden:'hidden',
    questions:[],
    allquestions:[],
    count:0, // 第几题
    fillblankContent:'',
    bordercolor:'',
    buttontext:'确定',
    isdisabled:false,
    radiovalue:'',
    checkboxvalue:null,
    isRight:null,
    ishidden:'hidden',
    myanswer:'',
    easyarr:[],
    mediumarr:[],
    hardarr:[],
    allUnits:[],
    homework:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */

  getClassInfo(){
    return new Promise(resolve=>{
      classcollection.where({
        classid:app.globalData.classid
      }).get({
        success:res=>{
          resolve(res);
        }
      })      
    })
  },
  getUnits(){
    return new Promise(reso=>{
      this.getClassInfo().then((res)=>{
        let homework=res.data[0].homework;  // 所有单元
        this.setData({
          homework:homework,
          allUnits:Object.keys(homework),
          loadhidden:'hidden',
          allhihdden:'',
        });
        console.log(this.data.allUnits);
      });
    })
  },
  requstQuestion(id){
    
  },
  getQuestion(e){
    let unitid=e.currentTarget.dataset.item;
    console.log(this.data.homework[unitid]);
    let qlist=this.data.homework[unitid];
    wx.navigateTo({
      url: '../questions/questions?list='+qlist,
    });
    
  },
  onReady: function (options) {
    this.setData({
      loadhidden:''
    });
    this.getUnits();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      loadhidden:'hidden'
    })
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