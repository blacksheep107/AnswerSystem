// miniprogram/pages/answer/answer.js
const db=wx.cloud.database();
const easy=db.collection('easy_question');
const medium=db.collection('medium_question');
const hard=db.collection('hard_question');
const users=db.collection('users');
const app=getApp();
const _=db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadhidden:'',
    finhidden:'hidden',
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
    if(this.data.buttontext=='确定'){
      // 判断正误
      this.setData({
        isdisabled:true,
      });
      if(this.data.questions[this.data.count].type=='choose'){
        if(this.data.questions[this.data.count].choosenum=='1'){
          this.setData({
            myanswer:this.data.radiovalue
          });
          if(this.data.questions[this.data.count].answer==this.data.radiovalue){
            this.setData({
              isRight:true,
              bordercolor:'1px solid green',
              ishidden:'hidden',
            });
          }else{
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              ishidden:''
            });
          }
        }else if(this.data.questions[this.data.count].choosenum>'1'){
          this.setData({
            myanswer:this.data.checkboxvalue
          });
          if(this.data.checkboxvalue==null){
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              ishidden:''
            })
          }else if(this.data.questions[this.data.count].answer.toString()==this.data.checkboxvalue.toString()){
            this.setData({
              isRight:true,
              bordercolor:'1px solid green',
              ishidden:'hidden'
            });
          }else{
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              ishidden:''
            });
          }
        }
      }else if(this.data.questions[this.data.count].type=='fillblank'){
        this.setData({
          myanswer:this.data.fillblankContent
        });
        if(this.data.questions[this.data.count].answer==this.data.fillblankContent){
          this.setData({
            isRight:true,
            ishidden:'hidden'
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
      users.doc(app.globalData.id).update({
        data:{
          answeredquestions:_.push({
            question:this.data.questions[this.data.count],
            isRight:this.data.isRight,
            myanswer:this.data.answer
          })
        }
      })
    }else{
      this.setData({
        buttontext:'确定',
        count:this.data.count+1,
        isRight:null,
        ishidden:'hidden',
        fillblankContent:'',
        isdisabled:false,
        bordercolor:'',
      });
      if(this.data.count==this.data.questions.length-1){
        this.setData({
          finhidden:''
        });
      }
    }
  },
  getEasy(){
    return new Promise((resol)=>{
      easy.get().then(res=>{
        new Promise((resolve)=>{
          let count=0;
          res.data.forEach(item=>{
            if(!(item._id in app.globalData.answeredquestions)){
              this.setData({
                questions:this.data.questions.concat(item)
              });
            }
            count++;
            if(count==res.data.length){
              console.log(count);
              resolve();
            }
          });
        }).then(()=>{
          console.log('简单题获取');
          console.log(this.data.questions);
          resol();
        })
      });
    })
  },
  getMedium(){
    return new Promise((resol)=>{
      medium.get().then(res=>{
        console.log(res.data);
        new Promise((resolve)=>{
          let count=0;
          res.data.forEach(item=>{
            if(!(item._id in app.globalData.answeredquestions)){
              // 没答过
              this.setData({
                questions:this.data.questions.concat(item)
              });
            }
            count++;
            if(count==res.data.length){
              console.log(count);
              resolve();
            }
          });
        }).then(()=>{
          console.log('中等题获取')
          console.log(this.data.questions);
          resol();
        })
      });
    })
  },
  getHard(){
    return new Promise((resol)=>{
      hard.get().then(res=>{
        console.log(res.data);
        new Promise((resolve)=>{
          let count=0;
          res.data.forEach(item=>{
            if(!(item._id in app.globalData.answeredquestions)){
              // 没答过
              this.setData({
                questions:this.data.questions.concat(item)
              });
            }
            count++;
            if(count==res.data.length)  resolve();
          });
          resolve();     
        }).then(()=>{
          console.log('难题获取');
          console.log(this.data.questions);
          resol();
        })
      });
    })
  },
  onLoad: function (options) {
    this.getEasy().then(()=>{
        console.log('简单！！！！！！！！！！！！！！');
        this.getMedium().then(()=>{
          console.log('中等！！！！！！！！！！');
          this.getHard().then(()=>{
            // 去重
            let temp=[];
            // console.log(app.globalData.answerid);
            this.setData({
              questions:this.data.questions.filter((item)=>{
                // console.log(item);
                // console.log(app.globalData.answerid.indexOf(item));
                return app.globalData.answerid.indexOf(item._id)==-1;
              })
            })
            // this.data.questions.filter((item)=>{
            //   return app.globalData.answerid.indexOf(item)==-1;
            // })
            // console.log(this.data.questions);
            // for(let i=0;i<this.data.questions.length;i++){
            //   console.log(this.data.questions[i]._id);
            //   if(!(this.data.questions[i]._id in app.globalData.answerid)){
            //     temp.push(this.data.questions[i]);
            //   }else{
            //     console.log(1);
            //   }
            // }
            // this.data.questions=temp;
            // console.log(this.data.questions);
          })
          }
        )      
      }
    )
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