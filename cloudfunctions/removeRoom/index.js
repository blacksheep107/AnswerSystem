// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'fzuanswersystem-4gg97ebafd3efbe9',
})
const db=cloud.database({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const _=db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('hello');
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