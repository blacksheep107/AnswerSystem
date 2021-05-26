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
          // 多选
          this.setData({
            myanswer:this.data.checkboxvalue
          });
          if(this.data.checkboxvalue==null){
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              ishidden:''
            })
          }else if(!this.data.questions[this.data.count].isorder){
            // 不按序
            let temp1=this.data.questions[this.data.count].answer;
            let temp2=this.data.checkboxvalue;
            console.log(temp1);
            console.log(temp2);
            temp1.sort();
            temp2.sort();
            if(temp1.toString()==temp2.toString()){
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
          }else if(this.data.questions[this.data.count].isorder&&this.data.questions[this.data.count].answer.toString()==this.data.checkboxvalue.toString()){
            // 按序
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
            myanswer:this.data.myanswer
          })
        }
      });
      app.globalData.answeredquestions.push({
        question:this.data.questions[this.data.count],
        isRight:this.data.isRight,
        myanswer:this.data.myanswer
      });
      app.globalData.answerid.push(this.data.questions[this.data.count]._id);

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
  getClassInfo(){
    return new Promise(resolve=>{
      classcollection.where({
        classid:app.globalData.classid
      }).get({
        success:res=>{
          console.log(res);
          app.globalData.allquestionsid=res.data[0].questions;
          // 过滤
          // console.log(app.globalData.allquestionsid);
          // console.log(app.globalData.answerid);
          app.globalData.allquestionsid=app.globalData.allquestionsid.filter(item=>{
            return app.globalData.answerid.indexOf(item)===-1;
          });
          resolve();
        }
      })      
    })
  },
  findQuestion(id){
    console.log(id);
    return new Promise(resolve=>{
      easy.doc(id).get({
        success:res=>{
          this.data.easyarr.push(res.data);
          resolve();
        },
        fail:res=>{
          medium.doc(id).get({
            success:res=>{
              this.data.mediumarr.push(res.data);
              resolve();
            },
            fail:res=>{
              hard.doc(id).get({
                success:res=>{
                  this.data.hardarr.push(res.data);
                  resolve();
                },
                fail:res=>{
                  wx.showModal({
                    title:'提示',
                    content:'加载失败！',
                    showCancel:false
                  });
                }
              })
            }
          })
        }
      });      
    })
  },
  getQuestions(){
    return new Promise(reso=>{
      this.getClassInfo().then(()=>{
        // 找到所有题目详情，放三个数组，最后合成一个
        new Promise(resolve=>{
          (async ()=>{
            console.log(app.globalData.allquestionsid);
            if(app.globalData.allquestionsid.length==0) resolve();
            for(let i=0;i<app.globalData.allquestionsid.length;i++){
              let id=app.globalData.allquestionsid[i];
              await this.findQuestion(id);
              if(i==app.globalData.allquestionsid.length-1){
                resolve();
              }
            }
          })()
        }).then(()=>{
          reso();
        });
      });
    })
  },
  onReady: function (options) {
    this.setData({
      loadhidden:''
    });
    this.getQuestions().then(()=>{
      this.setData({
        questions:this.data.easyarr.concat(this.data.mediumarr.concat(this.data.hardarr))
      });
      console.log(this.data.questions);
      this.setData({
        loadhidden:'hidden',
        allhihdden:''
      });
    })
    // console.log(app.globalData);
    // this.getEasy().then(()=>{
    //     console.log('简单！！！！！！！！！！！！！！');
    //     this.getMedium().then(()=>{
    //       console.log('中等！！！！！！！！！！');
    //       this.getHard().then(()=>{
    //         // erase answered questions
    //         let temp=[];
    //         console.log(app.globalData.answerid);
    //         this.setData({
    //           questions:this.data.questions.filter((item)=>{
    //             return app.globalData.answerid.indexOf(item._id)===-1;
    //           })
    //         });
    //         this.setData({
    //           loadhidden:'hidden',
    //           allhihdden:''
    //         });
    //       })
    //       }
    //     )      
    //   }
    // )
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