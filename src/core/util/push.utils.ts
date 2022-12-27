import axios from 'axios';

export const sendPush = async(token:string,title:string,message:string)=>{
    axios.post('https://fcm.googleapis.com/fcm/send',{
        "data":{
          "title":title,
          "message":message
        },
        "to":token
      }
      ,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`key=${process.env.PUSH_SERVER_KEY}`
        }
    })
}