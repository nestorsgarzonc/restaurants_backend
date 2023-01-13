import AWS from 'aws-sdk';
import fs from  'fs';
import Jimp from 'jimp';


export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  });


export const decodeBase64Img = (base64Img,imgId) => {
    const buffer = Buffer.from(base64Img, "base64");
    Jimp.read(buffer, (err, res) => {
        if (err) throw new Error(err.message);
        res.quality(5).write(`img${imgId}.jpg`);
      });
}

//TODO: Borrar imágenes del server

export const uploadImageS3 = async(base64Img,imgId)=>{
    decodeBase64Img(base64Img,imgId);
    const blob = fs.readFileSync(`img${imgId}.jpg`);
    const uploadedImage = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imgId,
        Body: blob,
      }).promise();
    return  uploadedImage.Location;

}
