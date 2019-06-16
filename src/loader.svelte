<script>
	import { onMount } from 'svelte';
    onMount( ()=>{
        const canvas = document.getElementById("field");
        const ctx = canvas.getContext('2d');

                //Мяч
        const ball = {
            x: canvas.width/2,
            y: canvas.height/2,
            radius: 10,
            speed: 5,
            moveX: 5,
            moveY: 5,
            color:"WHITE"
        }
        //Левый отбойник
        const left_side={
            x: 0,
            y: (canvas.height - 100)/2,
            width:10,
            height:100,
            score:0,
            color:"RED"
        }

        //Правый отбойник
        const rigth_side={
            x: canvas.width - 10,
            y: (canvas.height - 100)/2,
            width:10,
            height:100,
            score:0,
            color:"BLUE"
        }

        //Сетка
        const net = {
        x : (canvas.width - 2)/2,
        y : 0,
        height : 10,
        width : 2,
        color : "WHITE"
        }


        /* Для отрисовки прямоугольников (Сетка и отбойники) */
        function drawRect(x, y, w, h, color){
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }

        /** Для отрисовки мяча */
        function drawArc(x, y, r, color){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
        }

        /* Для отрисовки мяча по центру после счета */
        function resetBall(){
            ball.x = canvas.width/2;
            ball.y = canvas.height/2;
            ball.moveX = -ball.moveX;
            ball.speed = 7;
        }


        /* Для отрисовки сетки */
        function drawNet(){
            for(let i = 0; i <= canvas.height; i+=15){
                drawRect(net.x, net.y + i, net.width, net.height, net.color);
            }
        }


        /*Для отрисовки текста */
        function drawText(text,x,y){
            ctx.fillStyle = "#FFF";
            ctx.font = "75px fantasy";
            ctx.fillText(text, x, y);
        }

        /* Для определения столкнулся с отбойником мяч или нет */
        function collision(b,p){
            p.top = p.y;
            p.bottom = p.y + p.height;
            p.left = p.x;
            p.right = p.x + p.width;
            
            b.top = b.y - b.radius;
            b.bottom = b.y + b.radius;
            b.left = b.x - b.radius;
            b.right = b.x + b.radius;
            
            return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
        }


        /* Обновляем положение вещей */
        function update(){
            
            if( ball.x - ball.radius < 0 ){
                rigth_side.score++;
                resetBall();
            }else if( ball.x + ball.radius > canvas.width){
                left_side.score++;
                resetBall();
            }
            
            ball.x += ball.moveX;
            ball.y += ball.moveY;
            
            rigth_side.y += ((ball.y - (rigth_side.y + rigth_side.height/2)))*0.1;

            left_side.y += ((ball.y - (left_side.y + left_side.height/2)))*0.11;
            
            if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
                ball.moveY = -ball.moveY;
            }
            
            let player = (ball.x + ball.radius < canvas.width/2) ? left_side : rigth_side;
            
            if(collision(ball,player)){


                let collidePoint = (ball.y - (player.y + player.height/2));

                collidePoint = collidePoint / (player.height/2);
                

                let angleRad = (Math.PI/4) * collidePoint;
                
                let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;

                if ( direction == 1 ){
                    ball.color = "RED";
                }
                else{
                    ball.color = "BLUE";
                }
                ball.moveX = direction * ball.speed * Math.cos(angleRad);
                ball.moveY = ball.speed * Math.sin(angleRad);
                
                ball.speed += 0.5;
            }
        }

        function render(){
            
            // clear the canvas
            drawRect(0, 0, canvas.width, canvas.height, "#000");
            
            // draw the left_side score to the left
            drawText(left_side.score,canvas.width/4,canvas.height/5);
            
            // draw the rigth_side score to the right
            drawText(rigth_side.score,3*canvas.width/4,canvas.height/5);
            
            // draw the net
            drawNet();
            
            // draw the left_side's paddle
            drawRect(left_side.x, left_side.y, left_side.width, left_side.height, left_side.color);
            
            // draw the rigth_side's paddle
            drawRect(rigth_side.x, rigth_side.y, rigth_side.width, rigth_side.height, rigth_side.color);
            
            // draw the ball
            drawArc(ball.x, ball.y, ball.radius, ball.color);
        }

        function game(){
            update();
            render();
        }

        let framePerSecond = 50;

        //call the game function 50 times every 1 Sec
        let loop = setInterval(game,1000/framePerSecond);
    })

</script>

<div class="container">
    <div class="row col-12 justify-content-center align-items-center">
        <canvas id="field" width="600" height="400"></canvas>
    </div>
</div>


