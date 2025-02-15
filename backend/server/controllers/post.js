const { post, get } = require("../models");
const { uploadToS3 } = require("./helpers/s3helpers.js");
const axios = require('axios');


/* define post request handlers here */

module.exports = {
  createSnome: async (req, res) => {
    // 0. Accept request from client - uploadSnomePhotos middleware provides access to request.files
    // 1. create a snome record in db using non-file data from request returning id of inserted snome
    try {
      const inserted_id = await post.createSnome(req.body);
      res.status(201).send('Success!');
    } catch (err) {
      console.log(`SERVER SIDE ERROR - POST: ${err}`)
      res.status(500).send(err);
    }

    // 2. instantiate empty Promise array
    let uploadPhotoPromises = [];

    // 3. loop over req.files...
    let photos = req.files;
    photos.forEach((photo) => {
      // call uploadToS3 function with fileName (object in array itself) and fileKey -> return promise
      // push each Promise onto Promise array
      try {
        uploadPhotoPromises.push(uploadToS3(photo, "snome_photo"));
      } catch (err) {
        console.log(`SERVER SIDE ERROR - POST: ${err}`);
        res.status(500).send(err);
      }
    });
    photosUrl = [];
    // 4. call Promise.all on promise array to upload files in parallel
    await Promise.all(uploadPhotoPromises).then(async (urls) => {
      // 5. create snomePhotos in db using snome_id and s3 urls
      urls.forEach(async (url) => {
        photosUrl.push(url);
      });
    });

    try {
      await post.createSnomePhoto(snome_id, photosUrl);
    } catch (error) {
      console.log(`SERVER SIDE ERROR - POST: ${err}`);
      res.status(500).send(err);
    }

    // 5. respond with success to client if loop completes
    res.status(201).send("SUCCESS!");
  },

  createSnomePhotos: async (req, res) => {
    // 1. get snome id from request.params
    const snome_id = req.params.id;
    // 2. instantiate empty Promise array
    let uploadPhotoPromises = [];
    // 3. loop over req.files...
    let photos = req.files;
    photos.forEach((photo) => {
      // call uploadToS3 function with fileName (object in array itself) and fileKey -> return promise
      // push each Promise onto Promise array
      try {
        uploadPhotoPromises.push(uploadToS3(photo));
      } catch (err) {
        console.log(`SERVER SIDE ERROR - POST: ${err}`);
        res.status(500).send(err);
      }
    });
    photosUrl = [];
    // 4. call Promise.all on promise array to upload files in parallel
    await Promise.all(uploadPhotoPromises).then(async (urls) => {
      // 5. create snomePhotos in db using snome_id and s3 urls
      urls.forEach(async (url) => {
        photosUrl.push(url);
      });
    });

    try {
      await post.createSnomePhoto(snome_id, photosUrl);
    } catch (error) {
      console.log(`SERVER SIDE ERROR - POST: ${err}`);
      res.status(500).send(err);
    }

    // 5. create snomePhotos in db using snome_id and s3 urls
    res.status(201).send("SUCCESS!");
  },

  //createUser moved to './user'

  createLike: async (req, res) => {
    try {
      await post.createLike(req.params);
      let result = await get.checkMatch(req.params);
      if(result.state) {
        await post.createMatch(result.data);
      }
      console.log(result);
      res.status(200).send('Success!');
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },

  createMessage: (req, res) => {
  // createMessage: async (req, res) => {
    // try {
    //   console.log(req.body);
    //   let data = await post.createMessage(req.body);
    //   res.status(200).json(data);
    // } catch (err) {
    //   console.log(err);
    //   res.status(400).send(err);
    // }
    post
      .createMessage(req.body)
      .then((data) => {
        console.log({...req.body, time: data.time, id:data.id})
        // console.log(data)
        res.send({...req.body, time: data.time, id:data.id});
        return data
      })
      .then((data) => {
        // console.log(JSON.stringify({...req.body, time: data}))
        //once saved to db, send to recipient via websockets
        axios.post(`http://localhost:8080/${req.body.recipient_id}`,
        {msg_txt: JSON.stringify({...req.body, time: data.time, id: data.id})},
        // {msg_txt: req.body.message_text},
        {headers: {'Content-Type': 'application/json;charset=utf-8'}}
        )
      })
      .catch(err => {
        res.status(500).send(
          "Some error occurred while creating the message."
        )
      })
  },

  createReview: async (req, res) => {
    post
      .createReview(req.body)
      .then((data) => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send(
          "Some error occurred while creating the review."
        )
      })
  },

  // <TEMPLATE>: async (req, res) => {
  //   try {
  //     let data = await get.<TEMPLATE>(req.body);
  //     res.status(200).json(data);
  //   } catch(err) {
  //     console.log(err);
  //     res.status(400).send(err);
  //   }
  // },
};
