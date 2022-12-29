import axios from 'axios';

export const sendPush = async(token:string,title:string,message:string)=>{
  console.log('/////////////////////////////');
  console.log(token);
  console.log('/////////////////////////////');
    axios.post('https://fcm.googleapis.com/fcm/send',{
      "notification":{
          "title":title,
          "body":message
        },
        "to":token
      }
      ,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`key=${process.env.PUSH_SERVER_KEY}`
        }
    }).then((response)=>{
      console.log(response);
    }).catch(()=>{console.log('Error al hacer petición a google')});
}