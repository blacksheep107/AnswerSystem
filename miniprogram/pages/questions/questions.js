// miniprogram/pages/questions/questions.js
const db=wx.cloud.database();
const app=getApp();
const classcollection=db.collection('class');
const quesitons=db.collection('questions');
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      loadhidden:'',
    });
    let temp=options.list.split(',');
    let count=0;
    // 放三个数组
    new Promise(resolve=>{
      // 过滤
      for(let i=0;i<temp.length;i++){
        if(app.globalData.answerid.indexOf(temp[i])!=-1){
          count++;
        }else{
          this.data.idlist.push(temp[i]);
        }
      }
      this.data.idlist.forEach(id=>{
        quesitons.doc(id).get({
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
          questions:this.data.easyq
        });
      }else if(this.data.mediumq.length>0){
        this.setData({
          questions:this.data.mediumq
        });
      }else if(this.data.hardq.length>0){
        this.setData({
          questions:this.data.hardq
        });
      }else{
        wx.showModal({
          title:'提示',
          content:'本章节闯关完成！',
          showCancel:false,
          success: (result) => {
            if(result.confirm){
              wx.navigateBack();
            }
          },
        })
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
      console.log(this.data.count);
      console.log(this.data.questions.length);
      if(this.data.count==this.data.questions.length-1){
        this.setData({
          finhidden:''
        });
      }
    }
  },
})