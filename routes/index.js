const express = require("express");

const router = express.Router();

// mysql연결
const mysqlConnobj = require('../config/mysql');
const conn = mysqlConnobj.init();
mysqlConnobj.open(conn); // 연결 출력


// 기본 주소 설정
router.get('/', (req,res)=>{
    const sql = "select * from ndboard order by num asc";
    // const sql = "select * from ndboard order by orNum desc, grNum asc";
    
    //날짜
    

    //들여쓰기(grLayer 숫자에 따라 들여쓰기)
    conn.query(sql,(err, row, fields) => {
        if(err)
            console.log(err);
        else{
            console.dir(row);
            res.render('index', {title:"게시판 목록", row:row});
        }
    })
    // render : 페이지 실행
});

router.get("/write", (req,res)=>{
    res.render("write", {title:"게시판 글쓰기"});
});

router.get("/view",(req,res)=>{
    res.render("view" , {title:"내용"});
})

module.exports = router;