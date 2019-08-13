class Bullet{
	constructor(id, x, y, radius, angle, speed, color){
		this.id = id;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.angle = angle;
		this.speed = speed;
		this.color = color;
	}
	draw(){
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
		context.fill();
		context.closePath();
	}
	update(){
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
	}
	collision(object){
		if(areColliding(this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2, object.x, object.y, object.sx, object.sy)){
			return true;
		}else{
			return false;
		}
	}
}
class Player{
	constructor(x, y, radius, health, angle, speed, color){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.health = health;
		this.angle = angle;
		this.speed = speed;
		this.color = color;
		this.level = 0;
		this.xp = 0;
		this.xpToNextLevel = this.level * 10 + 10;
		this.damage_circle_radius = this.radius * 3;
		this.damage_circle_color = "rgb(0, 255, 20)";
		this.bullets = [];
		this.maxHealth = this.health;
		this.levelY = 50;
		this.defaultLevelY = this.levelY;
		this.level_up_text_global_alpha = 0;
	}
	level_up(bonusXp){
		this.level++;
		this.xp = bonusXp;
		this.damage_circle_radius += this.radius * 0.1;
		this.health = 100;
		this.level_up_animation();
	}
	update_angle(){
		this.angle = Math.atan2(mouseY - this.y, mouseX - this.x);
	}
	update(){
		if(Math.sqrt(Math.pow(mouseX - this.x, 2)+Math.pow(mouseY - this.y, 2))>(15+this.damage_circle_radius)){
			this.x += Math.cos(this.angle) * this.speed;
			this.y += Math.sin(this.angle) * this.speed;
		}
		for(let i=0; i<this.bullets.length; i++){
			if(this.bullets[i].x+this.bullets[i].radius<0 || this.bullets[i].x-this.bullets[i].radius>canvas.offsetWidth || this.bullets[i].y+this.bullets[i].radius<0 || this.bullets[i].y-this.bullets[i].radius>canvas.offsetHeight){
				this.bullets.pop();
			}
		}
		if(this.x-this.damage_circle_radius<=0){
			this.x = this.damage_circle_radius;
		}
		if(this.y-this.damage_circle_radius<=0){
			this.y = this.damage_circle_radius;
		}

		if(this.x+this.damage_circle_radius>=canvas.offsetWidth){
			this.x = canvas.offsetWidth-this.damage_circle_radius;
		}
		if(this.y+this.damage_circle_radius>=canvas.offsetHeight){
			this.y = canvas.offsetHeight-this.damage_circle_radius;
		}
		if(this.xp>=this.xpToNextLevel){
			this.level_up(this.xp-this.xpToNextLevel);//this.level_up_animation(0, Math.abs(this.xp - this.xpToNextLevel));
		}
	}
	shoot(){
		this.bullets.unshift(new Bullet(this.bullets.length, Math.cos(this.angle) * this.radius + this.x, Math.sin(this.angle) * this.radius + this.y, 5, this.angle, 4, "red"));
	}
	draw(){
		context.fillStyle = this.damage_circle_color;
		context.globalAlpha = 0.5;
		context.beginPath();
		context.arc(this.x, this.y, this.damage_circle_radius, 0, Math.PI*2);
		context.fill();
		context.globalAlpha = 1;
		context.lineWidth = 2;
		context.strokeStyle = "black";
		context.stroke();
		context.closePath();

		context.fillStyle = this.color;
		context.globalAlpha = 1;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
		context.fill();
		context.closePath();

		context.fillStyle = "grey";
		context.fillRect(this.x-this.radius-7.5, this.y-this.radius-32.5, this.radius*2+15, 27.5);
		context.fillStyle = "red";
		context.fillRect(this.x-this.radius-5, this.y-this.radius-30, (this.radius*2+10)*this.health/this.maxHealth, 10);
		context.fillStyle = "blue";
		context.fillRect(this.x-this.radius-5, this.y-this.radius-17.5, (this.radius*2+10)*this.xp/this.xpToNextLevel, 10);

		context.beginPath();
		context.strokeStyle = "red";
		context.lineWidth = 4;
		context.moveTo(this.x, this.y);
		context.lineTo(Math.cos(this.angle) * this.radius + this.x, Math.sin(this.angle) * this.radius + this.y);
		context.stroke();
		context.closePath();

		context.font = "50pt Arial";
		context.fillText(this.level, this.x, this.levelY);
		context.fillStyle = "yellow";
		context.globalAlpha = this.level_up_text_global_alpha;
		context.fillText("Level Up!", canvas.offsetWidth/2-50, this.levelY);
		context.globalAlpha = 1;
	}
	damage(damage){
		this.health -= damage;
		this.damage_circle_color = "rgb(" + ((this.maxHealth-this.health)/this.maxHealth)*255 + ", " + this.health/this.maxHealth*255 + ", 20)";
	}
	collision(object){
		let distX = this.x-object.x;
		let distY = this.y-object.y;

		if(Math.sqrt(Math.pow(distX, 2)+Math.pow(distY, 2))<object.sx/2+this.damage_circle_radius-3){
			return true;
		}else{
			return false;
		}
	}
	level_up_animation(){
		while(this.level_up_text_global_alpha<1){
			this.level_up_text_global_alpha+=0.00000001;
		}
	}
}

class Enemy{
    constructor(id, x, y, sx, sy, health, angle, speed, damage, color){
    	this.id = id;
        this.x = x;
        this.y = y;
        this.sx = sx;
        this.sy = sy;
        this.health = health;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.color = color;
        this.maxHealth = this.health;
    }
    update_angle(targetX, targetY){
        this.angle = Math.atan2(targetY - this.y, targetX - this.x);
    }
    draw(){
    	context.fillStyle = this.color;
        drawRotatedImage(this.x, this.y, this.sx, this.sy, this.angle);

        context.fillStyle = "grey";
        context.fillRect(this.x-this.sx/2, this.y-30, this.sx, 10);
        context.fillStyle = this.color;
        context.fillRect(this.x-this.sx/2+2.5, this.y-27.5, (this.sx-5)*this.health/this.maxHealth, 5);
    }
    update(){
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}

function drawRotatedImage(x, y, sizeY, sizeY, angle) { 
	context.save(); 
	context.translate(x, y);
	context.rotate(angle+ Math.PI/2);
    context.fillRect(-sizeY/2, -sizeY/2, sizeY, sizeY);
	context.restore(); 
}

var player = new Player(canvas.offsetWidth/2, canvas.offsetHeight/2, 20, 100, 0, 4.2, "blue");
var enemys = [];
var isOnPlay = true, gameOver = false;

enemys.push(new Enemy(enemys.length, Math.random()*canvas.offsetWidth, Math.random()*canvas.offsetHeight, 25, 25, 10, Math.PI*2, 1, 0.01, "red"));

function update() {
	if(isOnPlay && !gameOver){
		player.update();
		if(player.bullets.length>0){
			for(bullet of player.bullets){
				bullet.update();

		    	for(enemy of enemys){
					if(bullet.collision(enemy)){
						enemy.health -= 1;

						player.bullets.splice(bullet.id, 1);					
					}
				}
			}
		}
	    for(enemy of enemys){
	    	enemy.update_angle(player.x, player.y);
	    	enemy.update();

	    	if(player.collision(enemy)){
	    		player.damage(enemy.damage);
	    	}

			if(enemy.health<=0){

				for(let i=2; i<=11; i++){
					if(i==11){
						enemys.splice(enemy.id, 1, new Enemy(enemy.id, Math.random()*canvas.offsetWidth, Math.random()*canvas.offsetHeight, 15, 15, 1, Math.PI*2, 1, 1, "red"));
						break;
					}
					let random = Math.floor(Math.random()*11+2);
					if(random%i==0){
						enemys.splice(enemy.id, 1, new Enemy(enemy.id, Math.random()*canvas.offsetWidth, Math.random()*canvas.offsetHeight, 15+i, 15+i, i, Math.PI*2, 1, (11-i)/100, "red"));
						break;
					}
				}
				if(enemys.length%Math.floor(Math.random()*4+1)==0){
					for(let i=2; i<=11; i++){
						if(i==11){
							enemys.push(new Enemy(enemys.length, Math.random()*canvas.offsetWidth, Math.random()*canvas.offsetHeight, 15, 15, 1, Math.PI*2, 1, 1, "red"));
							break;
						}
						if(enemys.length%i==0){
							enemys.push(new Enemy(enemys.length, Math.random()*canvas.offsetWidth, Math.random()*canvas.offsetHeight, 15+i, 15+i, i, Math.PI*2, 1, (11-i)/100, "red"));
							break;
						}
					}
				}

				player.xp++;
				player.health++;
			}
	    }
	    if(player.health>=player.maxHealth){
	    	player.health = player.maxHealth;
	    }
	    if(player.health<=0){
	    	player.health = 0;
	    }
	}
}
function draw() {
	player.draw();
	for(bullet of player.bullets){
		bullet.draw();
	}
    for(enemy of enemys){
    	enemy.draw();
    }
}
function keyup(key) {
}
function mouseup() { 
	player.shoot();
}
function mousemove(){
	player.update_angle();
}
