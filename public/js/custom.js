//jquery
$(function() {
    $("#del").click(function(){ // 삭제하기 btn click
        //password 가져오기
        const delpass = $("#password_del").val();
        const delnum = $("#delnum").val();
        // alert("del클릭" + delpass + "그리고"+delnum);
        $.ajax({
            url:'/del',
            type:'post',
            data:{delpass:delpass, delnum:delnum},
            success:function(data){
                const rs = parseInt(data);
                if(rs > 0){
                    alert("삭제 성공!😺");
                    location.href="/";
                }else{
                    alert("비번틀림");
                    $("#password_del").val('');
                    $("#password_del").focus();
                }
            },
            error:function(xhr){
                alert("삭제하는데 에러가 발생했습니다.");
                $("#password_del").val('');
                $("#password_del").focus();
            }
        })

    })
})