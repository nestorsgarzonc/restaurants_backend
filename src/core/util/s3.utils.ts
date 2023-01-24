import AWS from 'aws-sdk';
import fs from  'fs';
require('dotenv').config();
const jpeg = require('jpeg-js');
export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  });



export const uploadImageS3 = async(base64Img:string,imgId:string,bucket)=>{
    const buffer =  Buffer.from(base64Img, 'base64');
    const type = base64Img.split(';')[0].split('/')[1];
    const uploadedImage = await s3.upload({
        Bucket: bucket,
        Key: `img${imgId}`,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      }).promise();
    
    return  uploadedImage.Location;

}
