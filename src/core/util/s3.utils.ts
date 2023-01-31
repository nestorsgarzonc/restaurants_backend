import AWS from 'aws-sdk';
const uuid = require('uuid');

require('dotenv').config();
const jpeg = require('jpeg-js');
export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  });



export const uploadImageS3 = async(base64Img:string,bucket)=>{

  
    const buffer =  Buffer.from(base64Img, 'base64');
    const type = base64Img.split(';')[0].split('/')[1];
    const uploadedImage = await s3.upload({
        Bucket: bucket,
        Key: `img${uuid.v4()}`,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      }).promise();
    
    return  uploadedImage.Location;
}

export const updateImageS3 = async(base64Img:string,prevImgUrl,bucket)=>{
  if(prevImgUrl){
    const prevImgId = prevImgUrl.split('/').at(-1);
    s3.deleteObject({
      Bucket: bucket,
      Key: prevImgId
    },function (err,data){});
  }
  const buffer =  Buffer.from(base64Img, 'base64');
  const type = base64Img.split(';')[0].split('/')[1];
  const uploadedImage = await s3.upload({
      Bucket: bucket,
      Key: `img${uuid.v4()}`,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
    }).promise();
    
  return  uploadedImage.Location;
  
}
