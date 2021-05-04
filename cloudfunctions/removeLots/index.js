// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database();
const pk=db.collection('pk');
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    return await pk.where({
      _openid:event.openid
    }).remove()
  }catch(e){
    console.error(e);
  }
}