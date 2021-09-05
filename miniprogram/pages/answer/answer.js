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
    chance:{},
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
        let arr=Object.keys(res.data[0].homework).map(item=>{
          return Object.assign(res.data[0].homework[item], {name:item});
        });
        arr.sort(function(a,b){
          return a.index-b.index;
        })
        this.setData({
          homework:homework,
          allUnits:arr,
          loadhidden:'hidden',
          allhihdden:'',
        });
        users.doc(app.globalData.id).get({
          success:res=>{
            let score=res.data.score;
            for(let i=0;i<this.data.allUnits.length;i++){
              if(score[this.data.allUnits[i].name]==undefined){  //新单元
                score[this.data.allUnits[i].name]={
                  score:0,
                  chance:this.data.homework[this.data.allUnits[i].name].chance
                };
                this.data.chance[this.data.allUnits[i].name]=this.data.homework[this.data.allUnits[i].name].chance;
              }else{
                score[this.data.allUnits[i].name]={
                  score:res.data.score[this.data.allUnits[i].name].score,
                  chance:res.data.score[this.data.allUnits[i].name].chance,
                };
                this.data.chance[this.data.allUnits[i].name]=res.data.score[this.data.allUnits[i].name].chance;
              }
            }
            console.log(score);
            this.setData({
              chance:this.data.chance
            });
            users.doc(app.globalData.id).update({
              data:{
                score:score
              }
            });
          }
        })
      });
    })
  },
  getQuestion(e){
    let unitid=e.currentTarget.dataset.item;
    console.log(this.data.homework[unitid.name]);
    let qlist=this.data.homework[unitid.name];
    if(this.data.chance[unitid.name]<=0){
      wx.showModal({
        title:'提示',
        content:'你的答题机会已用完！',
        showCancel:false,
      });
    }else{
      wx.navigateTo({
        url: '../questions/questions?list='+qlist.questions+'&&unitname='+unitid.name+'&&chance='+this.data.chance[unitid.name],
      });      
    }
  },
  onReady: function (options) {
    this.setData({
      loadhidden:''
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      loadhidden:'hidden'
    });
    this.getUnits();
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