const express = require("express");

const router = express.Router();

// 기본 주소 설정
router.get('/', (req,res)=>{
    // render : 페이지 실행
    res.render('index', {title:"게시판 목록"});
});

router.get("/write", (req,res)=>{
    res.render("write", {title:"게시판 글쓰기"});
});

module.exports = router;