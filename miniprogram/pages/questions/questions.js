// miniprogram/pages/questions/questions.js
const db=wx.cloud.database();
const app=getApp();
const classcollection=db.collection('class');
const questions=db.collection('questions');
const _=db.command;
const users=db.collection('users');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    idlist:[],
    easyq:[],
    mediumq:[],
    hardq:[],
    loadhidden:'hidden',
    questions:[],
    count:0,  // 答到第几题
    finhidden:'hidden',
    fillblankContent:'',
    bordercolor:'',
    buttontext:'确定',
    isdisabled:false,
    radiovalue:'',
    checkboxvalue:null,
    isRight:null,
    ishidden:'hidden',
    myanswer:'',
    level:'',
    apassright:0, // 每关答对题目数
    unitname:'',
    rightArr:[],  // 本次答对的问题id
  },
  finishUnit(){
    wx.showModal({
      title:'提示',
      content:'本章节闯关完成！',
      showCancel:false,
      success: (result) => {
        if(result.confirm){
          wx.navigateBack();
        }
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      loadhidden:'',
      unitname:options.unitname
    });
    if(options.list==""){
      wx.showModal({
        title:'提示',
        content:'本单元还没有题目',
        showCancel:false,
        success:res=>{
          if(res.confirm){
            wx.navigateBack();
          }
        }
      })
    }
    let temp=options.list.split(',');
    let count=0;
    // 放三个数组
    new Promise(resolve=>{
      // 过滤
      for(let i=0;i<temp.length;i++){
        let index=app.globalData.answerid.indexOf(temp[i]);
        console.log(index);
        console.log(app.globalData.answeredquestions[index]);
        if(index!=-1&&app.globalData.answeredquestions[index].isRight==true){
          // 答过且答对，不重做
          ;
        }else{
          this.data.idlist.push(temp[i]);
        }
      }
      console.log(this.data.idlist);
      if(this.data.idlist.length==0){
        this.setData({
          loadhidden:'hidden',
          finhidden:'',
        });
      }
      this.data.idlist.forEach(id=>{
        questions.doc(id).get({
          success:res=>{
            if(res.data.level=='easy'){
              this.data.easyq.push(res.data);
            }else if(res.data.level=='medium'){
              this.data.mediumq.push(res.data);
            }else if(res.data.level=='hard'){
              this.data.hardq.push(res.data);
            }
            if(++count==this.data.idlist.length)  resolve();
          }
        });
      });      
    }).then(()=>{
      if(this.data.easyq.length>0){
        // 易未完成
        this.setData({
          questions:this.data.easyq,
          level:'easy'
        });
      }else if(this.data.mediumq.length>0){
        this.setData({
          questions:this.data.mediumq,
          level:'medium'
        });
      }else if(this.data.hardq.length>0){
        this.setData({
          questions:this.data.hardq,
          level:'hard'
        });
      }else{
        this.finishUnit();
      }
      this.setData({
        loadhidden:'hidden'
      });
      console.log(this.data.questions);
    })
  },
  changeContent(e){
    this.setData({
      fillblankContent:e.detail.value
    });
  },
  radiochange(e){
    this.setData({
      radiovalue:e.detail.value
    });
  },
  checkboxchange(e){
    this.setData({
      checkboxvalue:e.detail.value
    });
  },
  submit(){
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
              apassright:this.data.apassright+1
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
            // 空
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              ishidden:''
            })
          }else if(!this.data.questions[this.data.count].isorder){
            // 不按序
            let temp1=this.data.questions[this.data.count].answer;
            let temp2=this.data.myanswer;
            temp1.sort();
            temp2.sort();
            if(temp1.toString()==temp2.toString()){
              this.setData({
                isRight:true,
                bordercolor:'1px solid green',
                ishidden:'hidden',
                apassright:this.data.apassright+1
              });
            }else{
              this.setData({
                isRight:false,
                bordercolor:'1px solid red',
                ishidden:''
              });
            }
          }else if(this.data.questions[this.data.count].isorder&&this.data.questions[this.data.count].answer.toString()==this.data.myanswer.toString()){
            // 按序
            this.setData({
              isRight:true,
              bordercolor:'1px solid green',
              ishidden:'hidden',
              apassright:this.data.apassright+1
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
        // 填空
        this.setData({
          myanswer:this.data.fillblankContent
        });
        if(this.data.questions[this.data.count].answer==this.data.myanswer){
          this.setData({
            isRight:true,
            ishidden:'hidden',
            apassright:this.data.apassright+1
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
      // 更新教师端，学生做的正确错误
      questions.doc(this.data.questions[this.data.count]._id).get({
        success:res=>{
          console.log(res);
          let olddid=res.data.studentsdid;
          let flag=false;
          for(let i=0;i<olddid.length;i++){
            if(olddid[i].studentid==app.globalData.studentid){
              flag=true;
              olddid[i]={
                studentid:app.globalData.studentid,
                studentname:app.globalData.name,
                isRight:this.data.isRight
              }
              break;
            }
          }
          if(!flag){
            olddid.push({
              studentid:app.globalData.studentid,
              studentname:app.globalData.name,
              isRight:this.data.isRight
            });
          }
          console.log(olddid);
          questions.doc(this.data.questions[this.data.count]._id).update({
            data:{
              studentsdid:olddid
            },
            success:res=>{
              console.log(res);
            },
            fail:res=>{
              console.log(res);
            }
          })
        }
      })
      // 是否已答过，更新记录
      users.doc(app.globalData.id).get({
        success:res=>{
          let data=res.data.answeredquestions;
          let flag=false;
          let score=res.data.score;
          
          if(this.data.isRight){
            this.setData({
              rightArr:this.data.rightArr.concat(this.data.questions[this.data.count]._id)
            });
            // 做对加10分
            score[this.data.unitname]+=10;
            console.log(score);
            users.doc(app.globalData.id).update({
              data:{
                score:score
              }
            })
          }
          console.log(this.data.rightArr);
          // 更新users的数据
          for(let i=0;i<data.length;i++){
            if(data[i].question._id==this.data.questions[this.data.count]._id){
              data[i].isRight=this.data.isRight;
              data[i].myanswer=this.data.myanswer;
              users.doc(app.globalData.id).update({
                data:{
                  answeredquestions:data
                }
              });
              app.globalData.answeredquestions=data;
              flag=true;
              break;
            }
          }
          if(!flag){
            // 没做过的题
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
          }
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
      if(this.data.count==this.data.questions.length){
        // 结束一章的一关
        // 计算一关得分，全对进入下一关
        if(this.data.level=='easy'){
          if(this.data.apassright==this.data.questions.length){
            // 全对，下一关
            if(this.data.mediumq.length>0){
              this.setData({
                questions:this.data.mediumq,
                count:0
              });
            }else if(this.data.hardq.length>0){
              this.setData({
                questions:this.data.hardq,
                count:0
              });
            }else if(this.data.hardq.length==0){
              this.finishUnit();
            }
          }else{
            // 重答easy
            let questions=[];
            this.data.easyq.forEach(item=>{
              if(this.data.rightArr.indexOf(item._id)==-1){
                // 答对的题不再出现
                questions.push(item);
              }
            })
            this.setData({
              questions:questions,
              apassright:0,
              count:0,
              buttontext:'确定',
            });
          }
        }else if(this.data.level=='medium'){
          if(this.data.apassright==this.data.questions.length){
            // 全对，下一关
            if(this.data.hardq.length>0){
              this.setData({
                questions:this.data.hardq,
                count:0
              });
            }else{
              this.finishUnit();
            }            
          }else{
            // 重开medium
            let questions=[];
            this.data.mediumq.forEach(item=>{
              if(this.data.rightArr.indexOf(item._id)==-1){
                // 答对的题不再出现
                questions.push(item);
              }
            })
            this.setData({
              questions:questions,
              apassright:0,
              count:0,
              buttontext:'确定',
            });
          }
        }else if(this.data.level=='hard'){
          if(this.data.apassright==this.data.questions.length){
            this.finishUnit();
          }else{
            // 重开hard
            let questions=[];
            this.data.hardq.forEach(item=>{
              if(this.data.rightArr.indexOf(item._id)==-1){
                // 答对的题不再出现
                questions.push(item);
              }
            })
            this.setData({
              questions:questions,
              apassright:0,
              count:0,
              buttontext:'确定',
            });
          }
        }
      }
    }
  },
})