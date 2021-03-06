// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'fzuanswersystem-7g3gmzjw761ecfdb',
})
const db=cloud.database({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const _=db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await db.collection('pk').doc(event.roomid).remove({
      success:res=>{
        console.log(res);
      },
      fail:res=>{
        console.log(res);
      }
    })
  }catch(e){
    console.error(e);
  }
}