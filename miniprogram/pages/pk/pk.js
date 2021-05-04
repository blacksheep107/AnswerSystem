// miniprogram/pages/pk/pk.js
const app=getApp();
const db=wx.cloud.database();
const pk=db.collection('pk');
const _ = db.command;
const addPoint=20; // 回答正确加20

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questions:[],
    count:0,
    roomid:'',
    ownerid:'',
    draw:'hidden',
    leftwin:'hidden',
    rightwin:'hidden',
    background:'',
    leftpoint:0,
    rightpoint:0,
    isover:'hidden',
    leftisTrue:'hidden',
    rightisTrue:'hidden',
    leftisFalse:'hidden',
    rightisFalse:'hidden',
    answer:'',
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
  answerchange(e){
    this.setData({
      answer:e.detail.value
    })
  },
  submitanswer(e){
    let answer=this.data.answer;
    if(answer==this.data.questions[this.data.count].answer){
      // 对，分数变化双方都要看到
      if(this.data.ownerid==app.globalData.openid){
        // 房主,left
        pk.doc(this.data.roomid).update({
          data:{
            leftpoint:_.inc(addPoint),
          },
          success:res=>{
            this.setData({
              leftisTrue:'', // 显示正确
              background:'green',
              leftpoint:this.data.leftpoint,
            });
          }
        })
      }else{
        pk.doc(this.data.roomid).update({
          data:{
            rightpoint:_.inc(addPoint),
          },
          success:res=>{
            this.setData({
              rightisTrue:'', // 显示正确
              background:'green',
              rightpoint:this.data.rightpoint,
            });
          }
        })
      }
    }else{
      // 错
      if(answer==this.data.questions[this.data.count].answer){
        this.setData({
          leftisFalse:'',
          background:'red',
        });
      }else{
        this.setData({
          rightisFalse:'',
          background:'red',
        });
      }
    }
    var that=this;
    setTimeout(function(){
      that.setData({
        rightisTrue:'hidden',
        rightisFalse:'hidden',
        leftisFalse:'hidden',
        leftisTrue:'hidden',
        count:that.data.count+1,
        answer:'',
        background:'',
      });
    },2000);
    if(this.data.count==this.data.questions.length){
      // 结算
      calPoints();
    }

  },
  chooseanswer(e){
    console.log(e);
    let answer=e.currentTarget.dataset.value;
    this.setData({
      answer:answer
    });
    if(answer==this.data.questions[this.data.count].answer){
      // 对，分数变化双方都要看到
      if(this.data.ownerid==app.globalData.openid){
        // 房主,left
        pk.doc(this.data.roomid).update({
          data:{
            leftpoint:_.inc(addPoint),
          },
          success:res=>{
            this.setData({
              leftisTrue:'', // 显示正确
              background:'green',
            });
          }
        })
      }else{
        pk.doc(this.data.roomid).update({
          data:{
            rightpoint:_.inc(addPoint),
          },
          success:res=>{
            this.setData({
              rightisTrue:'', // 显示正确
              background:'green',
            });
          }
        })
      }
    }else{
      // 错
      if(answer==this.data.questions[this.data.count].answer){
        this.setData({
          leftisFalse:'',
          background:'red',
        });
      }else{
        this.setData({
          rightisFalse:'',
          background:'red',
        });
      }
    }
    var that=this;
    setTimeout(function(){
      that.setData({
        rightisTrue:'hidden',
        rightisFalse:'hidden',
        leftisFalse:'hidden',
        leftisTrue:'hidden',
        count:that.data.count+1,
        answer:'',
        background:'',
      });
    },2000);
    if(this.data.count==this.data.questions.length){
      // 结算
      calPoints();
    }
  },
  calPoints(){
    let leftpoint=this.data.leftpoint;
    let rightpoint=this.data.rightpoint;
    if(leftpoint>rightpoint){
      showLeftWin();
    }else if(leftpoint<rightpoint){
      showRightWin();
    }else{
      showDraw();
    }    
    this.setData({
      isover:''
    });
  },
  showLeftWin(){
    this.setData({
      leftwin:''
    });
  },
  showRightWin(){
    this.setData({
      rightwin:''
    });
  },
  showDraw(){
    // 平
    this.setData({
      draw:''
    });
  },
  sleep(time,callback){
    return new Promise(resolve=>setTimeout(callback,time));
  },
  onLoad: function (options) {
    pk.doc(options.roomid).get({
      success:res=>{
        console.log(res);
        this.setData({
          questions:res.data.questions,
          ownerid:res.data.ownerid,
          roomid:options.roomid,
          leftdata:res.data.leftdata,
          rightdata:res.data.rightdata,
        });
      }
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