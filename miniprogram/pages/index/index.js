//index.js
const app = getApp()
const db=wx.cloud.database();
const users=db.collection('users');
const pk=db.collection('pk');
const pk4=db.collection('pk4');
const easy=db.collection('easy_question');
const medium=db.collection('medium_question');
const hard=db.collection('hard_question');
const questions=db.collection('questions');

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    name:'',
    studentid:'',
    takeSession: false,
    requestResult: '',
    classid:'',
    answeredquestions:[],
    score:0,
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') // 如需尝试获取用户信息可改为false
  },

  onShow: function() {
      this.onGetOpenid().then(()=>{
        users.where({
          _openid: app.globalData.openid,
        }).get().then(res=>{
          console.log(res);
          if(res.data.length===0){
            // 未注册
            wx.showModal({
              title:'提示',
              content:'未注册用户无法记录成绩，是否前往注册？',
              success:res=>{
                if(res.confirm){
                  wx.navigateTo({
                    url: '../register/register',
                  })
                }
              }
            })
          }else{
            // 已注册
            app.globalData.studentid=res.data[0].studentid;
            app.globalData.name=res.data[0].name;
            app.globalData.id=res.data[0]._id;
            app.globalData.answeredquestions=res.data[0].answeredquestions;
            app.globalData.classid=res.data[0].class;
            for(let i=0;i<app.globalData.answeredquestions.length;i++){
              app.globalData.answerid.push(app.globalData.answeredquestions[i].question._id);
            }
            this.data.score=0;
            Object.keys(res.data[0].score).forEach(item=>{
              this.data.score+=res.data[0].score[item].score;
            });
            this.setData({
              name:res.data[0].name,
              studentid:res.data[0].studentid,
              classid:res.data[0].class,
              answeredquestions:res.data[0].answeredquestions,
              score:this.data.score
            });
            // 每次登陆都清空pk数据
            wx.cloud.callFunction({
              name:'removeLots',
              data:{
                openid:app.globalData.openid
              },
              success:res=>{
                console.log(res);
              }
            });
            wx.cloud.callFunction({
              name:'removeAllPk4',
              data:{
                openid:app.globalData.openid
              },
              success:res=>{
                console.log(res);
              },
            });
          }
        });
      });
  },
  naviToRecord(){
    wx.navigateTo({
      url: '../record/record',
    });
  },
  naviToPk4(){
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        app.globalData.userInfo=res.userInfo;
        // 是否建房
        pk4.where({
          status:'prepare',
        }).get().then(res=>{
          console.log(res);
          if(res.data.length==0){
            // 建房
            this.getRandomQuestions().then(()=>{
              console.log(app.globalData.pkquestions);
              this.createRoom4();
            });
          }else{
            // 加入
            let newuserdata,id,openid,flag=0;
            for(let i=0;i<res.data.length;i++){
              if(res.data[i].userdata.length==4)  continue;
              else{
                newuserdata=res.data[i].userdata;
                id=res.data[i]._id;
                openid=res.data[i]._openid;
                flag=1;
                break;
              }
            }
            if(!flag){
              // 都满员
              this.getRandomQuestions().then(()=>{
                console.log(app.globalData.pkquestions);
                this.createRoom4();
              });
            }else{
              let item={
                avatarUrl:app.globalData.userInfo.avatarUrl,
                nickName:app.globalData.userInfo.nickName,
                openid:app.globalData.openid,
                point:0,
              }
              newuserdata.push(item);
              pk4.doc(id).update({
                data:{
                  userdata:newuserdata,
                },
                success:res=>{
                  console.log(res);
                  // 更新userdata，进入房间
                  wx.navigateTo({
                    url: '../pk4prepare/pk4prepare?ownerid='+openid+'&&roomid='+id+'&&gametype=invite',
                  });
                }
              })              
            }

          }
        })
      }
    })
  },
  createRoom4(){
    console.log(app.globalData.pkquestions);
    let item={
      avatarUrl:app.globalData.userInfo.avatarUrl,
      nickName:app.globalData.userInfo.nickName,
      openid:app.globalData.openid,
      point:0,
    }
    let p=[];
    p.push(item);
    pk4.add({
      data:{
        ownerid:app.globalData.openid,
        status:'prepare',
        userdata:p,
        questions:app.globalData.pkquestions,
        finish:0,
      },
      success:res=>{
        console.log(res);
        wx.navigateTo({
          url: '../pk4prepare/pk4prepare?ownerid='+app.globalData.openid+'&&roomid='+res._id+'&&gametype=own',
        });
      }
    });
  },
  naviToFeedback(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },
  sign(){
    wx.showToast({
      title: '打卡成功',
    });
  },
  createRoom(){
    console.log(app.globalData.pkquestions);
    pk.add({
      data:{
        ownerid:app.globalData.openid,
        status:'prepare',
        leftdata:{
          avatarUrl:app.globalData.userInfo.avatarUrl,
          nickName:app.globalData.userInfo.nickName,
          openid:app.globalData.openid,
        },
        questions:app.globalData.pkquestions,
        finish:0,
      },
      success:res=>{
        console.log(res);
        wx.navigateTo({
          url: '../pkprepare/pkprepare?ownerid='+app.globalData.openid+'&&roomid='+res._id+'&&gametype=own',
        });
      }
    });
  },
  getQuestions(){
    return new Promise((resolve1)=>{
      questions.where({
        type:'choose',
        choosenum:1,
      }).get().then(res=>{
        app.globalData.allchoosequestions=res.data;
        resolve1();
      })
    })
  },
  getRandomQuestions(){
    return new Promise((resolve)=>{
      this.getQuestions().then(()=>{
        // 5题
        if(app.globalData.allchoosequestions.length<5){
          app.globalData.pkquestions=app.globalData.allchoosequestions;
          resolve();
        }else{
          let arr=[],count=0;
          new Promise((resolve1)=>{
            for(let i=0;i<5;i++){
              let x=Math.floor(Math.random()*app.globalData.allchoosequestions.length);
              if(arr.indexOf(x)!=-1){
                i--;
                continue;
              }else{
                arr.push(x);
                app.globalData.pkquestions.push(app.globalData.allchoosequestions[x]);
                if(++count==5)  resolve1();
              }
            }
          }).then(()=>{
            console.log(app.globalData.pkquestions);
            resolve();            
          })
        }
      });
    })
  },
  naviTofriendPK(){
    this.getRandomQuestions().then(()=>{
      // console.log(app.globalData.pkquestions);
      this.createRoom();
    });
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        app.globalData.userInfo=res.userInfo;
        this.naviTofriendPK();
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    return new Promise((resolve)=>{
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log(res)
          console.log('[云函数] [login] user openid: ', res.result.OPENID);
          app.globalData.openid = res.result.OPENID;
          resolve();
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err);
          resolve();
        }
      })      
    })

  },
  naviToAnswer(){
    wx.navigateTo({
      url: '../answer/answer',
    })
  },
  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
