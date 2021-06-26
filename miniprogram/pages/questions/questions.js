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
    score:0,  // 本次答题分数
    blankcontents:{}, // 填空题多个答案
  },
  finishUnit(){
    wx.showModal({
      title:'提示',
      content:'本章节闯关完成！',
      showCancel:false,
      success: (result) => {
        if(result.confirm){
          wx.navigateBack({
            delta:1
          });
        }
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
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
      this.data.idlist=temp;
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
      // 又改需求了，三个数组一起
      let questemp=this.data.easyq.concat(this.data.mediumq.concat(this.data.hardq));
      if(questemp.length>0){
        this.setData({
          questions:questemp
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
    this.data.blankcontents[e.target.dataset.index]=e.detail.value;
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
    this.setData({
      loadhidden:''
    });
    if(this.data.buttontext=='确定'){
      // 判断正误
      this.setData({
        isdisabled:true,
      });
      if(this.data.questions[this.data.count].type=='choose'){
        if(this.data.questions[this.data.count].choosenum=='1'){
          // 单选
          this.setData({
            myanswer:this.data.radiovalue
          });
          if(this.data.questions[this.data.count].answer==this.data.radiovalue){
            this.setData({
              isRight:true,
              bordercolor:'1px solid green',
              ishidden:'hidden',
              apassright:this.data.apassright+1,
              loadhidden:'hidden'
            });
          }else{
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              loadhidden:'hidden'
              // ishidden:''
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
              loadhidden:'hidden'
              // ishidden:''
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
                apassright:this.data.apassright+1,
                loadhidden:'hidden'
              });
            }else{
              this.setData({
                isRight:false,
                bordercolor:'1px solid red',
                loadhidden:'hidden'
                // ishidden:''
              });
            }
          }else if(this.data.questions[this.data.count].isorder&&this.data.questions[this.data.count].answer.toString()==this.data.myanswer.toString()){
            // 按序
            this.setData({
              isRight:true,
              bordercolor:'1px solid green',
              ishidden:'hidden',
              apassright:this.data.apassright+1,
              loadhidden:'hidden'
            });
          }else{
            this.setData({
              isRight:false,
              bordercolor:'1px solid red',
              loadhidden:'hidden'
              // ishidden:''
            });
          }
        }
      }else if(this.data.questions[this.data.count].type=='fillblank'){
        // 填空
        let temp=[];
        Object.keys(this.data.blankcontents).forEach(item=>{
          temp.push(this.data.blankcontents[item]);
        })
        this.data.myanswer=JSON.stringify(temp);
        console.log(this.data.myanswer);
        console.log(JSON.stringify(this.data.questions[this.data.count].answer));
        if(JSON.stringify(this.data.questions[this.data.count].answer)==this.data.myanswer){
          this.setData({
            isRight:true,
            ishidden:'hidden',
            apassright:this.data.apassright+1,
            loadhidden:'hidden'
          });
        }else{
          this.setData({
            isRight:false,
            loadhidden:'hidden'
            // ishidden:''
          });
        }
      }
      this.setData({
        buttontext:'下一题',
        loadhidden:'hidden'
      });
      // 更新教师端，学生做对一次则之后一直默认是对的
      questions.doc(this.data.questions[this.data.count]._id).get({
        success:res=>{
          console.log(res);
          let olddid=res.data.studentsdid;
          let flag=false;
          for(let i=0;i<olddid.length;i++){
            if(olddid[i].studentid==app.globalData.studentid){
              flag=true;
              // 做过这题，之前错了现在对了才改，之前对了就不改
              // 否则会刷分
              if(!old[i].isRight){
                olddid[i]={
                  studentid:app.globalData.studentid,
                  studentname:app.globalData.name,
                  isRight:this.data.isRight
                }                
              }
              break;
            }
          }
          if(!flag){
            // 没做过这题
            olddid.push({
              studentid:app.globalData.studentid,
              studentname:app.globalData.name,
              isRight:this.data.isRight
            });
          }
          // 更新做过题目的学生
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
      // 更新分数
      users.doc(app.globalData.id).get({
        success:res=>{
          let data=res.data.answeredquestions;
          let flag=false;
          let score=res.data.score;
          let oldRight;
          // 更新users的数据, 机会用完才显示记录TODO
          for(let i=0;i<data.length;i++){
            if(data[i].question._id==this.data.questions[this.data.count]._id){
              oldRight=data[i].isRight;
              // 如果做对了之后不再更新学生答案
              if(!oldRight&&this.data.isRight){
                // 之前做错，现在做对
                data[i].isRight=true;
                data[i].myanswer=this.data.myanswer;     
                users.doc(app.globalData.id).update({
                  data:{
                    answeredquestions:data
                  }
                });
                app.globalData.answeredquestions=data;
              }
              flag=true;
              break;
            }
          }
          // console.log(oldRight);  // 之前做的正误
          if(!flag){
            // 没做过的题
            if(this.data.isRight){
              // 做对
              this.setData({
                rightArr:this.data.rightArr.concat(this.data.questions[this.data.count]._id)
              });
              // 加分，没做过或做错的题才加分
              // 做对后再做错不减分
              let point=this.data.questions[this.data.count].point;
              if(point==undefined||point==""){
                // 未设置分值按0
                score[this.data.unitname].score+=0;
              }else{
                score[this.data.unitname].score+=Number.parseInt(point);
              }
              console.log(score);
              users.doc(app.globalData.id).update({
                data:{
                  score:score
                }
              })
            };
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
          }else if(this.data.isRight&&!oldRight){
            // 做过的题，之前做错这次做对，加分
              let point=this.data.questions[this.data.count].point;
              if(point==undefined||point==""){
                score[this.data.unitname].score+=0;
              }else{
                score[this.data.unitname].score+=Number.parseInt(point);
              }
              console.log(score);
              users.doc(app.globalData.id).update({
                data:{
                  score:score
                }
              });
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
        loadhidden:'hidden'
      });
      if(this.data.count==this.data.questions.length){
        // 结束一章答题，机会--，最后一次机会记录
        users.doc(app.globalData.id).get({
          success:res=>{
            res.data.score[this.data.unitname].chance--;
            console.log(res.data);
            users.doc(app.globalData.id).update({
              data:{
                score:res.data.score,
              },
              success:res=>{
                console.log(res);
                wx.showModal({
                  title:'提示',
                  content:'你已完成闯关！',
                  showCancel:false,
                  success:res=>{
                    if(res.confirm){
                      wx.navigateBack();
                    }
                  }
                })
              },
              fail:res=>{
                console.log(res);
              }
            })
          }
        })
      }
    }
  },
})