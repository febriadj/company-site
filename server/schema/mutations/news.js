const { GraphQLNonNull, GraphQLString, GraphQLBoolean } = require('graphql');
const { GraphQLUpload } = require('graphql-upload');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const NewsModel = require('../../database/models/news');
const NewsType = require('../types/news');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

exports.insert = {
  type: NewsType,
  args: {
    author: { type: new GraphQLNonNull(GraphQLString) },
    subject: { type: new GraphQLNonNull(GraphQLString) },
    shortDesc: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString) },
    attachment: { type: GraphQLUpload },
  },
  resolve: async (parent, args) => {
    try {
      const fileContent = await args.attachment;

      const key = `file-${uuidv4()}`;

      if (fileContent) {
        const stream = fileContent.createReadStream();

        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
          Body: stream,
          ContentType: fileContent.mimetype,
        }

        await s3.upload(params).promise();
      }

      const news = await NewsModel.create({
        id: uuidv4(),
        author: args.author,
        subject: args.subject,
        shortDesc: args.shortDesc,
        body: args.body,
        attachment: fileContent ? key : null,
      }, {
        logging: false,
      });

      return {
        success: true,
        message: '',
        ...news.dataValues,
      }
    }
    catch (error0) {
      console.log(error0);
      return {
        success: false,
        message: error0.message,
      }
    }
  },
}

exports.delete = {
  type: NewsType,
  args: {
    newsId: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    try {
      const news = await NewsModel.findOne({
        where: {
          id: args.newsId,
        },
        logging: false,
      });

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: news.dataValues.attachment,
      }

      const obj = s3.getObject(params);

      if (obj.params.Key) {
        await s3.deleteObject(params).promise();
      }

      await NewsModel.destroy({
        where: {
          id: args.newsId,
        },
        logging: false,
      });

      return {
        success: true,
        message: 'Managed to delete news',
        ...news.dataValues,
      }
    }
    catch (error0) {
      return {
        success: false,
        message: error0.message,
      }
    }
  },
}

exports.update = {
  type: NewsType,
  args: {
    newsId: { type: new GraphQLNonNull(GraphQLString) },
    subject: { type: GraphQLString },
    body: { type: GraphQLString },
    shortDesc: { type: GraphQLString },
    closed: { type: GraphQLBoolean },
    attachment: { type: GraphQLUpload },
    filename: { type: GraphQLString },
  },
  resolve: async (parent, args) => {
    try {
      const fileContent = await args.attachment;
      const key = `file-${uuidv4()}`;

      const objRequest = {
        ...args,
      }

      if (fileContent) {
        const news = await NewsModel.findOne({
          where: {
            id: args.newsId,
          },
          logging: false,
        });

        const obj = s3.getObject({
          Bucket: process.env.BUCKET_NAME,
          Key: news.dataValues.attachment,
        });

        if (obj.params.Key) {
          await s3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: news.dataValues.attachment,
          }).promise();
        }

        const stream = fileContent.createReadStream();

        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
          Body: stream,
          ContentType: fileContent.mimetype,
        }

        await s3.upload(params).promise();
        objRequest.attachment = key;
      }

      if (!fileContent) {
        objRequest.attachment = objRequest.filename;
      }

      delete objRequest.filename;
      const news = await NewsModel.update({
        ...objRequest,
      }, {
        where: {
          id: args.newsId,
        },
        logging: false,
      });

      return {
        success: true,
        message: 'Managed to update the news',
        ...news.dataValues,
      }
    }
    catch (error0) {
      return {
        success: false,
        message: error0.message,
      }
    }
  },
}
