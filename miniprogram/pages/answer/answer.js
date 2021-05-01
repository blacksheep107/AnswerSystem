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
    fillblankContent:'',
    buttontext:'确定',
    radiovalue:'',
    checkboxvalue:null,
    isRight:null,
    ishidden:'hidden',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  changeContent(e){
    this.setData({
      fillblankContent:e.detail.value
    });
  },
  radiochange(e){
    console.log(e);
    this.setData({
      radiovalue:e.detail.value
    });
  },
  checkboxchange(e){
    console.log(e);
    this.setData({
      checkboxvalue:e.detail.value
    });
  },
  submit(){
    console.log(this.data.questions[this.data.count]);
    // console.log(this.data.radiovalue); 
    if(this.data.buttontext=='确定'){
      // 判断正误
      if(this.data.questions[this.data.count].type=='choose'){
        if(this.data.questions[this.data.count].choosenum=='1'&&this.data.questions[this.data.count].answer==this.data.radiovalue){
          this.setData({
            isRight:true
          });
        }else{
          this.setData({
            isRight:false,
            ishidden:''
          });
        }
      }
      this.setData({
        buttontext:'下一题'
      });
    }else{
      this.setData({
        buttontext:'确定',
        count:this.data.count+1,
        isRight:null,
        ishidden:'hidden',
      });
    }

  },
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