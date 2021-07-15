// miniprogram/pages/pk/pk.js
const app=getApp();
const db=wx.cloud.database();
const pk=db.collection('pk');
const _ = db.command;
const addPoint=20; // 回答正确加20
var watchpoint;
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
    fontcolor:'',
    leftpoint:0,
    rightpoint:0,
    isover:'',
    loadhidden:'hidden',
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
    canIAnswer:'chooseanswer',
    counthidden:'',
    winnerhidden:'hidden',
    loserhidden:'hidden',
    coverhidden:'hidden',
  },
  chooseanswer(e){
    let answer=e.currentTarget.dataset.value;
    this.setData({
      answer:answer,
      canIAnswer:'',  // 取消监听函数，防止重复答题
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
              background:'#4BC356',
              fontcolor:'white',
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
              background:'#4BC356',
              fontcolor:'white',
            });
          }
        })
      }
    }else{
      // 错
      if(answer==this.data.questions[this.data.count].answer){
        this.setData({
          leftisFalse:'',
          background:'#BB5242',
          color:'white',
        });
      }else{
        this.setData({
          rightisFalse:'',
          background:'#BB5242',
          color:'white',
        });
      }
    }
    var that=this;
    if(this.data.count==this.data.questions.length-1){
      var that=this;
      pk.doc(this.data.roomid).update({
        data:{
          finish:_.inc(1)
        },
        success:res=>{
          console.log(res);
        }
      })
      setTimeout(function(){
        that.setData({
          rightisTrue:'hidden',
          rightisFalse:'hidden',
          leftisFalse:'hidden',
          leftisTrue:'hidden',
          count:that.data.count+1,
          answer:'',
          background:'',
          loadhidden:'hidden',
          isover:'hidden',
        });
      },2000);
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
        canIAnswer:'chooseanswer',
      });
      if(that.data.count<that.data.questions.length-1)  that.showCount();
    },2000);
  },
  // 显示第几题
  showCount(){
    this.setData({
      counthidden:''
    });
    var that=this;
    setTimeout(function(){
      that.setData({
        counthidden:'hidden'
      })
    },1500);
  },
  calPoints(){
    this.setData({
      coverhidden:'',
      loadhidden:'hidden',
      isover:'hidden',
    });
    let leftpoint=this.data.leftpoint;
    let rightpoint=this.data.rightpoint;
    if(leftpoint>rightpoint){
      this.showLeftWin();
    }else if(leftpoint<rightpoint){
      this.showRightWin();
    }else{
      this.showDraw();
    }    
  },
  showLeftWin(){
    // 房主赢
    this.setData({
      loadhidden:'hidden'
    });
    if(app.globalData.openid==this.data.ownerid){
      // 房主是左边
      this.setData({
        winnerhidden:'',
        loserhidden:'hidden',
      });      
    }else{
      // 右边
      this.setData({
        winnerhidden:'hidden',
        loserhidden:'',
      });
    }
  },
  showRightWin(){
    // 房主输
    this.setData({
      loadhidden:'hidden'
    });
    if(app.globalData.openid==this.data.ownerid){
      this.setData({
        winnerhidden:'hidden',
        loserhidden:'',
      });      
    }else{
      this.setData({
        winnerhidden:'',
        loserhidden:'hidden',
      });
    }
  },
  showDraw(){
    // 平
    this.setData({
      draw:'',
      loadhidden:'hidden'
    });
  },
  sleep(time,callback){
    return new Promise(resolve=>setTimeout(callback,time));
  },
  onLoad: function (options) {
    var that=this;
    setTimeout(function(){
      that.setData({
        counthidden:'hidden'
      });
    },1500);
    watchpoint=pk.doc(options.roomid).watch({
      onChange:snapshot=>{
        console.log(snapshot);
        if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields.leftpoint!==undefined){
          this.setData({
            leftpoint:snapshot.docChanges[0].updatedFields.leftpoint
          });
        }
        if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields.rightpoint!==undefined){
          this.setData({
            rightpoint:snapshot.docChanges[0].updatedFields.rightpoint
          });
        }
        if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields.finish==2){
          this.calPoints();
        }
      },
      onError:err=>{
        console.error(err);
      }
    })
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
})