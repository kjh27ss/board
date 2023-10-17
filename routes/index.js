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
        title:title,
        contents:content
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

router.post("/pwdlogin", (req,res)=>{
    const {num,pass,title,content} = req.body;    
    let sql = "select * from ndboard where num = ? and userpass = ?";
    // num == userpass 면 출력
    conn.query(sql, [num, pass],(err,row,fields)=>{
        if(err)
           console.log(err);
        else{
            if(row.length > 0){
                sql = "update ndboard set ? where num = ?";
                conn.query(sql,[{
                    title:title,
                    contents:content
                }, num],(err,fields)=>{
                    if(err){
                        res.send('0');
                        console.log(err);
                    }else{                        
                        res.send('1');
                        console.log("수정성공");
                    }
                });                
            }else{
                res.send('0');
            }
        }
    })
});

// 게시물 번호와 비번확인
// 성공1, 실패 0

router.post("/del",(req,res)=>{
    const { delpass,delnum } = req.body;
    let sql = "select count(*) as ct from ndboard where num = ? and userpass =?"; 
    conn.query(sql, [delnum,delpass],(err,row,fields)=>{
        if(err){
            res.send('0');
           console.log(err);
        }else{
            if(row[0].ct > 0){
                //삭제쿼리 작성
                sql = "delete from ndboard where num = ?";
                conn.query(sql, delnum,(err,fields)=>{
                    if(err){
                        console.log(err);
                        res.send('0');
                    }else{
                        console.log('삭제성공');
                        res.send('1');
                    }
                });
            }else{
                console.log("비번 틀림"+row[0].ct);
                res.send('0');
            }
        }
    })
})

router.get("/rewrite/:num",(req,res)=>{
    const {num} = req.params;
    const sql = "select num, orNum, grNum, grLayer from ndboard where num=?";    

    conn.query(sql, num, (err,row,fields)=>{
        if(err){
            console.log(err);
        }
        else{
            const rs = row[0];
            res.render('rewrite',{title:'답변글 등록',rs});
        }        
    })
})
.post("/rewrite", (req,res)=>{
    const {ornum, grnum, grlayer, writer, pass, title,content} = req.body;
    const userid ='guest'; // 나중에 회원제 만들면서 수정예정
    // 목록의 grNum이 받은 grNum 보다 클 경우 하나씩 업데이트
    let sql = "update ndboard set grNum = grNum + 1 where orNum = ? and grNum > ?";
    conn.query(sql,[ornum,grnum]);

    // insert
    sql = "insert into ndboard(orNum, grNum, grLayer, writer,userid, userpass,title,contents) values(?,?,?,?,?,?,?,?)";

    conn.query(sql, [
        parseInt(ornum),
        parseInt(grnum)+1,
        parseInt(grlayer)+1,
        writer,
        userid,
        pass,
        title,
        content
    ], (err,row,fields)=>{
        if(err){
            console.log(err);
        }else{
            console.log(row.insertId);
        };
        res.redirect("/");
    });

})

module.exports = router;