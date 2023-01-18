import AWS from 'aws-sdk';
import fs from  'fs';
require('dotenv').config();
const jpeg = require('jpeg-js');
export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  });


export const decodeBase64Img = (base64Img,imgId) => {
    const buffer =  Buffer.from(base64Img, 'base64');
    fs.writeFileSync(`img${imgId}.jpg`, buffer,'binary');
}

export const uploadImageS3 = async(base64Img:string,imgId:string,bucket)=>{
    decodeBase64Img(base64Img,imgId);
    const blob = fs.readFileSync(`img${imgId}.jpg`);
    console.log(blob);
    const image = jpeg.decode(blob, {useTArray: true});
    console.log(image);
    fs.unlink(`img${imgId}.jpg`,(err) => {if (err) throw err;});
    const uploadedImage = await s3.upload({
        Bucket: bucket,
        Key: `img${imgId}.jpg`,
        Body: image
      }).promise();
    return  uploadedImage.Location;

}
