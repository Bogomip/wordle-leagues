const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');
const { count } = require('console');
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jeg',
}

// DEFUNCT, FOR REFERENCE

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid Mime Type');

    if(isValid) {
      error = null;
    }

    callback(error, 'backend/images'); // relative to server.js
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
})

router.post('', multer({ storage: storage }).single('image'), (req, res, next) => {

  const imageUrl = req.protocol + '://' + req.get("host");

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: imageUrl + '/images/' + req.file.filename
  })

  console.log('New post added: ' + post.title);

  post.save().then(result => {

    res.status(201).json({
      message: 'Post added successfully',
       post: {
         id: result.id,
         title: result.title,
         content: result.content,
         imagePath: result.imagePath
       }
    })

  });

})

router.put("/:id", multer({ storage: storage }).single('image'), (req, res, next) => {

  let post;

  if(req.file) {
    // new file uploaded...
    const imageUrl = req.protocol + '://' + req.get("host");
    post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imageUrl + '/images/' + req.file.filename
    })
  } else {
    // no new file uploaded...
    post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: req.body.imagePath
    })
  }

  Post.updateOne({ _id: req.params.id }, post).then((result) => {
    res.status(200).json({
      message: 'Update Successful',
      post: post
    })
  })
})

// meanuseradmin
// Z3y7M5xKNphSCnp



router.get('', (req, res, next) => {

  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let postArray;

  if(pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  // fetch all posts
  postQuery.then((documents) => {
    postArray = documents;
    return Post.count();
  }).then((count) => {
    res.status(200).json({
      success: true,
      data: postArray,
      maxPosts: count
    })
  })
})



router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if(post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  })
})

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: 'deleted boom'});
  })
})

module.exports = router;
