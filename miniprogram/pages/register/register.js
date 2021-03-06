// miniprogram/pages/register/register.js
const db=wx.cloud.database();
const users=db.collection('users');
const app=getApp();
const classcollection=db.collection('class');
const _=db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    studentid:"",
    name:"",
    classid:"",
    loadhidden:'hidden'
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
  joinclass(e){
    this.setData({
      classid:e.detail.value
    });
  },
  registerClick(){
    // 提交
    this.setData({
      loadhidden:''
    });
    console.log(this.data);
    classcollection.where({
      classid:this.data.classid
    }).get({
      success:res=>{
        console.log(res);
        if(res.data.length==0){
          this.setData({
            loadhidden:'hidden'
          });
          wx.showModal({
            title:'提示',
            content:'没有此班级编号！',
            showCancel:false,
            success:res=>{
              if(res.confirm){
                wx.navigateBack({
                  delta: 0,
                });
              }
            }
          });
        }else{
          users.add({
            data:{
              // openid:app.globalData.openid,
              studentid:this.data.studentid,
              name:this.data.name,
              class:this.data.classid,
              answeredquestions:[], // 回答过的问题
              score:{}, // 每章节分数
            },
            success:res1=>{
              // 写入班级学生
              classcollection.doc(res.data[0]._id).update({
                data:{
                  students:_.push(this.data.studentid)
                },
                success:res2=>{
                  console.log(res2);
                  this.setData({
                    loadhidden:'hidden'
                  });
                  wx.showModal({
                    title:'提示',
                    content:'注册成功',
                    showCancel:false,
                    success:res=>{
                      console.log(res);
                      if(res.confirm){
                        wx.navigateBack({
                          delta: 0,
                        });
                      }
                    },
                    fail:res2=>{
                      console.log(res2);
                    }
                  });
                  this.globalData.name=this.data.name;
                  this.globalData.studentid=this.data.studentid;
                  this.globalData.id=res._id; // 数据库索引
                  this.globalData.classid=this.data.classid;  // 班级                  
                },
                fail:res=>{
                  console.log(res);
                }
              })
            },
          })          
        }
      }
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