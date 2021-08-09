const app=getApp();
wx.cloud.init({
  env: 'fzuanswersystem-7g3gmzjw761ecfdb'
});
const db=wx.cloud.database({
  env: 'fzuanswersystem-7g3gmzjw761ecfdb'
});
const pk=db.collection('pk4');
var roomid='';
var watchpk;
const _ = db.command;
Page({
  data: {
    ownerid:'',
    pbuttonishide:'hidden',
    sbuttonhide:'hidden',
    ownerbegin:'hidden',
    roomid:'',
    userdata:[],  // 展示信息
    vstexthidden:'hidden',
  },
  beginpk(){
    console.log(this.data.roomid);
    pk.doc(this.data.roomid).get().then(res=>{
      console.log(res,'满人');
      if(res.data.userdata.length==4){
        pk.doc(this.data.roomid).update({
          data:{
            status:'pk',
            // userdata:this.data.userdata
          },
          success:res=>{
            console.log(res);
          }
        })        
      }else{
        wx.showModal({
          title:'提示',
          content:'未满4人，无法开始比赛！',
          showCancel:false,
        });
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.roomid=options.roomid;
    pk.doc(options.roomid).get({
      success:res=>{
        this.setData({
          userdata:res.data.userdata,
          ownerid:res.data.ownerid
        });
        console.log(this.data.userdata)
        if(this.data.ownerid==app.globalData.openid){
          this.setData({
            ownerbegin:'',
          });
        }
      }
    });
    watchpk=pk.doc(options.roomid).watch({
      onChange:snapshot=>{
        console.log(snapshot);
        let updatestr=snapshot.docChanges[0].updatedFields;
        console.log(updatestr);
        
        if(snapshot.docChanges[0].dataType=='update'&&updatestr!=undefined){
          let str=Object.keys(updatestr);
          if(str[0].slice(0,8)=='userdata'){
            if(str[0]=='userdata'){
              this.setData({
                userdata:updatestr['userdata']
              });
            }else{
              // 当别人进入房间的时候会监听到，测试困难
              // 查询拿到最新的userdata
              pk.doc(this.data.roomid).get().then(res=>{
                console.log(res);
                this.setData({
                  userdata:res.data.userdata
                });
              })
            }
          }
        }
        if(snapshot.docChanges[0].dataType=='update'&&updatestr.status=='pk'){
          console.log(111);
          watchpk.close();
          wx.navigateTo({
            url: '../pk4/pk4?roomid='+this.data.roomid,
          });
        }
      },
      onError:err=>{
        console.error(err);
      }
    })
  },
  onUnload:function(){
    // 用户退出，删除房间
    watchpk.close();
    wx.cloud.callFunction({
      name:'removeRoom',
      data:{
        roomid:this.data.roomid
      },
      success:res=>{
        console.log(res);
      },
      fail:console.error
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res.userInfo.avatarUrl);
        let newavatar='';
        if(res.userInfo.avatarUrl==''){
          newavatar='https://pic1.zhimg.com/80/v2-6afa72220d29f045c15217aa6b275808_720w.jpg?source=1940ef5c';
        }
        pk.doc(this.data.roomid).update({
          data:{
            rightdata:{
              avatarUrl:res.userInfo.avatarUrl,
              nickName:res.userInfo.nickName,
            },
          },
          success:res=>{
            console.log(res);
            this.setData({
              pbuttonishide:'hidden',
            });
          }
        });
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title:'来和我PK吧',
      path:'/pages/pkprepare/pkprepare?roomid='+this.data.roomid+'&&gametype=invite',
    }
  }
})