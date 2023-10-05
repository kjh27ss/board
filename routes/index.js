const express = require("express");

const router = express.Router();

// mysql연결
const mysqlConnobj = require('../config/mysql');
const conn = mysqlConnobj.init();
mysqlConnobj.open(conn); // 연결 출력


// 기본 주소 설정
router.get('/', (req,res)=>{
    // const sql = "select * from ndboard order by num asc";
    const sql = "select * from ndboard order by orNum desc, grNum asc";   

    conn.query(sql,(err, row, fields) => {
        if(err)
            console.log(err);
        else{
            // console.dir(row);
            let odate;
            for(let rs of row){
                // console.log(rs.grLayer);
                rs.grLayer *=30;
                odate = new Date(rs.wdate);
                rs.wdate = `${odate.getFullYear()} - ${odate.getMonth()+1} - ${odate.getDate()}`
                
            }
            console.log(row);
            res.render('index', {title:"게시판 목록", row:row});
        }
    })
    // render : 페이지 실행
});

router.get("/write", (req,res)=>{
    res.render("write", {title:"게시판 글쓰기"});
});

router.post("/write", (req,res)=>{
    const rs = req.body;
    let sql = "insert into ndboard(orNum, grNum, writer,userid, userpass,title,contents) values(?,?,?,?,?,?,?)";

    conn.query(sql,[0,1,rs.writer,'guest',rs.pass,rs.title,rs.content], (err,res,fields)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(res.insertId); // autoincrement 값 받는 방법
            sql = "update ndboard set ? where num =" + res.insertId; // insertId에 맞는 내용을 insert 함.
            conn.query(sql, {orNum:res.insertId},
                (err, res, fields)=>{
                    if(err)
                        console.log(err);
                    else{
                        console.log('업데이트 성공😻');
                    }
                });
        }

    })
    res.redirect('/');
});

router.get("/view/:num",(req,res)=>{
    const { num } = req.params;
    const sql = "select * from ndboard where num = ?"

    conn.query(sql, [num],(err,row,fields)=>{
        if(err)
           console.log(err);
        else{
            res.render("view" , {title:"내용", row});
        }
    });
    
});

router.get("/edit/:num", (req,res)=>{
    const { num } = req.params;
    const sql = "select * from ndboard where num = ?";

    conn.query(sql, [num],(err,row,fields)=>{
        if(err)
           console.log(err);
        else{
            res.render("edit" , {title:"수정", row});
        }
    })
})

router.post("/edit/:num",(req,res)=>{
    const {num} = req.params;
    const rs = req.body;
    const sql = "update ndboard set ? where num = ?";

    conn.query(sql,[{
        title:rs.title,
        contents:rs.content
    }, num],

    (err,res,fields)=>{
        if(err)
           console.log(err);
        else{
            console.log("업데이트 성공!");
        }
    })
    res.redirect('/view/'+num);

});

module.exports = router;