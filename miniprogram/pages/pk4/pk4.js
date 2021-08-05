// miniprogram/pages/pk/pk.js
const app=getApp();
const db=wx.cloud.database();
const pk=db.collection('pk4');
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
    background:'',
    fontcolor:'',
    isover:'',
    loadhidden:'hidden',
    answer:'',
    canIAnswer:'chooseanswer',
    counthidden:'',
    winnerhidden:'hidden',
    loserhidden:'hidden',
    coverhidden:'hidden',
    userdata:[],
    avatarUrl:app.globalData.userInfo.avatarUrl,
    nickName:app.globalData.userInfo.nickName,
    indexInUserdata:0,
  },
  chooseanswer(e){
    let answer=e.currentTarget.dataset.value;
    this.setData({
      answer:answer,
      canIAnswer:'',  // 取消监听函数，防止重复答题
    });
    if(answer==this.data.questions[this.data.count].answer){
      // 答对，分数变化直接更新到数据库
      // 先更新本地，答对加10分
      this.data.userdata[this.data.indexInUserdata].point+=10;
      this.setData({
        background:'#4BC356',
        fontcolor:'white',
      });
      pk.doc(this.data.roomid).update({
        data:{
          userdata:this.data.userdata
        },
        success:res=>{
          // 更新后
          // console.log(res,'userdata');
        }
      })
    }else{
      // 答错不用更新分数
      this.setData({
        background:'#BB5242',
        color:'white',
      });
    }
    var that=this;
    if(this.data.count==this.data.questions.length-1){
      // 答完最后一题
      // 所有请求都没有做错误处理，可用性--
      // finish：结束答题的人数
      var that=this;
      pk.doc(this.data.roomid).update({
        data:{
          finish:_.inc(1)
        }
      })
      setTimeout(function(){
        that.setData({
          count:that.data.count+1,
          answer:'',
          background:'',
          loadhidden:'',
          isover:'hidden',
        });
      },2000);
    }
    var that=this;
    setTimeout(function(){
      that.setData({
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
    // 跳转到排行榜
    watchpoint.close();
    wx.navigateTo({
      url: '../pkrankpage/pkrankpage?roomid='+this.data.roomid,
    });
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
    this.setData({
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName
    });
    pk.doc(options.roomid).get({
      success:res=>{
        console.log(res);
        for(let i=0;i<res.data.userdata.length;i++){
          if(res.data.userdata[i].openid==app.globalData.userInfo.openid){
            // 记录自己是数组的第几个
            this.setData({
              indexInUserdata:i
            });
            break;
          }
        }
        this.setData({
          questions:res.data.questions,
          ownerid:res.data.ownerid,
          roomid:options.roomid,
          userdata:res.data.userdata,
        });
      }
    });
    var that=this;
    setTimeout(function(){
      that.setData({
        counthidden:'hidden'
      });
    },1500);
    watchpoint=pk.doc(options.roomid).watch({
      onChange:snapshot=>{
        let updatestr=snapshot.docChanges[0].updatedFields;
        // console.log(snapshot);
        console.log(updatestr);
        if(updatestr){
          // 更新分数
          if(updatestr.userdata){
            this.setData({
              userdata:updatestr.userdata
            });  
          }else if(updatestr.finish==4){
            // 4人结束答题
            this.calPoints();
          }else{
            // 直接写数据库 key是userdata.1.point
            pk.doc(this.data.roomid).get().then(res=>{
              this.setData({
                userdata:res.data.userdata
              });
            });
          }
          // let key=Object.keys(updatestr)[0];
          // console.log(key);
          // if(key.slice(0,8)=='userdata'){
          //   console.log(updatestr[key]);
          // }
        }
        // if(snapshot.docChanges[0].dataType=='update'&&snapshot.docChanges[0].updatedFields.finish==2){
        //   // 结算
        //   this.calPoints();
        // }
      },
      onError:err=>{
        console.error(err);
      }
    });
  },
})